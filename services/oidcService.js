/**
 * OidcService
 *
 * Single sign-on through any OpenID Connect provider (Authentik, Authelia,
 * Keycloak, ...). It implements the authorization code flow with PKCE, state
 * and nonce, and nothing provider-specific: everything comes from the
 * provider's discovery document.
 *
 * Zettelrobbe has exactly one local account (the setup wizard creates it and
 * addUser() replaces any previous one), so SSO does not provision users. An
 * identity from the provider is mapped onto that existing account by a claim
 * (OIDC_USERNAME_CLAIM, preferred_username by default) and can be further
 * limited to members of OIDC_ALLOWED_GROUPS. Every other identity is refused.
 *
 * The protocol work is delegated to openid-client, which validates the ID
 * token (issuer, audience, expiry, nonce) and the PKCE exchange.
 */

const client = require('openid-client');
const config = require('../config/config');

const CALLBACK_PATH = '/auth/oidc/callback';
// Discovery and token requests should not leave a login hanging.
const REQUEST_TIMEOUT_SECONDS = 10;

/**
 * Reads a claim by name. A dotted name ("realm_access.roles") walks into
 * nested objects, which some providers use for roles and groups.
 *
 * @param {object} claims
 * @param {string} name
 * @returns {*}
 */
function readClaim(claims, name) {
  if (!claims || !name) return undefined;
  if (Object.prototype.hasOwnProperty.call(claims, name)) {
    return claims[name];
  }
  return name.split('.').reduce((value, key) => {
    if (value && typeof value === 'object') return value[key];
    return undefined;
  }, claims);
}

/**
 * Normalizes a groups claim into an array of strings. Providers send a list,
 * but a single group sometimes arrives as a bare string.
 *
 * @param {*} value
 * @returns {string[]}
 */
function toGroupList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

class OidcService {
  constructor() {
    this._clientConfigPromise = null;
    this._clientConfigKey = null;
  }

  /** @returns {ReturnType<typeof config.getOidcConfig>} */
  getSettings() {
    return config.getOidcConfig();
  }

  /**
   * True when SSO is switched on and has the minimum it needs to run.
   * A half-configured provider is treated as off rather than shown as a
   * button that can only fail.
   *
   * @returns {boolean}
   */
  isEnabled() {
    const settings = this.getSettings();
    return Boolean(settings.enabled && settings.issuerUrl && settings.clientId);
  }

  /**
   * What the login page needs to know about SSO.
   *
   * @returns {{ enabled: boolean, providerName: string, autoRedirect: boolean }}
   */
  getLoginViewState() {
    const settings = this.getSettings();
    const enabled = this.isEnabled();
    return {
      enabled,
      providerName: settings.providerName,
      autoRedirect: enabled && settings.autoRedirect,
    };
  }

  /**
   * Discovers the provider once and reuses the result. The cache is keyed on
   * the settings it was built from, so changed settings take effect, and a
   * failed discovery is not cached, so a provider that was down at the first
   * attempt is retried on the next login.
   *
   * @returns {Promise<import('openid-client').Configuration>}
   */
  async getClientConfig() {
    const settings = this.getSettings();
    const key = JSON.stringify([
      settings.issuerUrl,
      settings.clientId,
      settings.clientSecret,
    ]);

    if (this._clientConfigPromise && this._clientConfigKey === key) {
      return this._clientConfigPromise;
    }

    const issuer = new URL(settings.issuerUrl);
    const options = { timeout: REQUEST_TIMEOUT_SECONDS };
    if (issuer.protocol === 'http:') {
      // Plain HTTP is only acceptable on a trusted network, but homelab
      // providers often run that way behind the same reverse proxy.
      console.warn(
        '[WARN] OIDC_ISSUER_URL uses plain HTTP. Use HTTPS unless the provider is only reachable on a trusted network.'
      );
      options.execute = [client.allowInsecureRequests];
    }

    this._clientConfigKey = key;
    this._clientConfigPromise = client
      .discovery(
        issuer,
        settings.clientId,
        settings.clientSecret || undefined,
        undefined,
        options
      )
      .catch((error) => {
        if (this._clientConfigKey === key) {
          this._clientConfigPromise = null;
          this._clientConfigKey = null;
        }
        throw error;
      });

    return this._clientConfigPromise;
  }

  /**
   * The redirect URI registered with the provider. OIDC_REDIRECT_URI wins;
   * otherwise it is derived from the request, which honours TRUST_PROXY for
   * the protocol and host when the app runs behind a reverse proxy.
   *
   * @param {import('express').Request} req
   * @returns {string}
   */
  resolveRedirectUri(req) {
    const settings = this.getSettings();
    if (settings.redirectUri) {
      return settings.redirectUri;
    }
    return `${req.protocol}://${req.get('host')}${CALLBACK_PATH}`;
  }

  /**
   * Builds the provider's authorization URL and the values the callback must
   * check it against.
   *
   * @param {import('express').Request} req
   * @returns {Promise<{ url: string, transaction: { state: string, nonce: string, codeVerifier: string, redirectUri: string } }>}
   */
  async startLogin(req) {
    const settings = this.getSettings();
    const clientConfig = await this.getClientConfig();
    const redirectUri = this.resolveRedirectUri(req);

    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();
    const nonce = client.randomNonce();

    const url = client.buildAuthorizationUrl(clientConfig, {
      redirect_uri: redirectUri,
      scope: settings.scopes,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    });

    return {
      url: url.href,
      transaction: { state, nonce, codeVerifier, redirectUri },
    };
  }

  /**
   * Exchanges the authorization code and returns the user's claims: the
   * validated ID token claims, completed from the userinfo endpoint where the
   * provider offers one (some providers keep profile claims such as groups
   * out of the ID token).
   *
   * @param {URLSearchParams|string} callbackQuery - the query string the provider redirected back with
   * @param {{ state: string, nonce: string, codeVerifier: string, redirectUri: string }} transaction
   * @returns {Promise<object>}
   */
  async completeLogin(callbackQuery, transaction) {
    const clientConfig = await this.getClientConfig();

    // Rebuild the callback URL from the redirect URI that was sent to the
    // provider rather than from the incoming request: openid-client sends
    // this URL (minus the query) as redirect_uri in the token request, and it
    // must match the authorization request exactly, whatever a reverse proxy
    // did to the Host header in between.
    const currentUrl = new URL(transaction.redirectUri);
    currentUrl.search = new URLSearchParams(callbackQuery).toString();

    const tokens = await client.authorizationCodeGrant(
      clientConfig,
      currentUrl,
      {
        pkceCodeVerifier: transaction.codeVerifier,
        expectedState: transaction.state,
        expectedNonce: transaction.nonce,
        idTokenExpected: true,
      }
    );

    const idClaims = tokens.claims() || {};
    let userInfo = {};
    if (clientConfig.serverMetadata().userinfo_endpoint) {
      try {
        userInfo = await client.fetchUserInfo(
          clientConfig,
          tokens.access_token,
          idClaims.sub
        );
      } catch (error) {
        // The ID token alone is enough to sign in; userinfo only adds claims.
        console.warn(
          '[WARN] OIDC userinfo request failed, continuing with ID token claims:',
          error.message
        );
      }
    }

    // The ID token is authoritative for anything it carries.
    return { ...userInfo, ...idClaims };
  }

  /**
   * Decides whether an identity may sign in and which local account it maps
   * to. Pure: it only looks at the claims and the given list of users.
   *
   * @param {object} claims - the user's claims from completeLogin()
   * @param {Array<{ id: number, username: string }>} users - local accounts
   * @returns {{ user: object|null, error: string|null, claimedUsername: string|null }}
   */
  authorize(claims, users) {
    const settings = this.getSettings();
    const rawUsername = readClaim(claims, settings.usernameClaim);
    const claimedUsername =
      typeof rawUsername === 'string' && rawUsername.trim()
        ? rawUsername.trim()
        : null;

    if (!claimedUsername) {
      return {
        user: null,
        claimedUsername: null,
        error: `The identity provider did not send the "${settings.usernameClaim}" claim. Check OIDC_USERNAME_CLAIM and the scopes requested in OIDC_SCOPES.`,
      };
    }

    if (settings.allowedGroups.length > 0) {
      const groups = toGroupList(readClaim(claims, settings.groupsClaim));
      const allowed = settings.allowedGroups.some((group) =>
        groups.includes(group)
      );
      if (!allowed) {
        return {
          user: null,
          claimedUsername,
          error: 'Your account is not in a group that may use Zettelrobbe.',
        };
      }
    }

    const list = Array.isArray(users) ? users : [];
    const exact = list.find((user) => user.username === claimedUsername);
    const folded = claimedUsername.toLowerCase();
    const match =
      exact ||
      list.find(
        (user) =>
          typeof user.username === 'string' &&
          user.username.toLowerCase() === folded
      );

    if (!match) {
      return {
        user: null,
        claimedUsername,
        error:
          'No Zettelrobbe account matches your single sign-on identity. Ask the administrator to align the usernames.',
      };
    }

    return { user: match, claimedUsername, error: null };
  }

  /**
   * The provider's end-session URL for RP-initiated logout, or null when
   * provider logout is off or the provider does not advertise one.
   *
   * @param {import('express').Request} req
   * @returns {Promise<string|null>}
   */
  async buildLogoutUrl(req) {
    const settings = this.getSettings();
    if (!this.isEnabled() || !settings.providerLogout) {
      return null;
    }

    const clientConfig = await this.getClientConfig();
    if (!clientConfig.serverMetadata().end_session_endpoint) {
      return null;
    }

    const postLogoutRedirectUri =
      settings.postLogoutRedirectUri ||
      `${new URL(this.resolveRedirectUri(req)).origin}/login?local=1`;

    return client.buildEndSessionUrl(clientConfig, {
      client_id: settings.clientId,
      post_logout_redirect_uri: postLogoutRedirectUri,
    }).href;
  }
}

module.exports = new OidcService();
module.exports.CALLBACK_PATH = CALLBACK_PATH;
module.exports.readClaim = readClaim;
module.exports.toGroupList = toGroupList;
