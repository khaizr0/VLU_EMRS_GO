import {
  BrowserCacheLocation,
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
  type Configuration,
} from "@azure/msal-browser";

const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
const authority =
  import.meta.env.VITE_MICROSOFT_AUTHORITY ||
  "https://login.microsoftonline.com/organizations";
const apiScope = import.meta.env.VITE_MICROSOFT_API_SCOPE;
const redirectUri =
  import.meta.env.VITE_MICROSOFT_REDIRECT_URI || window.location.origin;

if (!clientId || !apiScope) {
  throw new Error(
    "Thiếu VITE_MICROSOFT_CLIENT_ID hoặc VITE_MICROSOFT_API_SCOPE.",
  );
}

const configuration: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
  },
};

export const msal = new PublicClientApplication(configuration);

const initialization = msal.initialize().then(async () => {
  const redirectResult = await msal.handleRedirectPromise();
  if (redirectResult?.account) {
    msal.setActiveAccount(redirectResult.account);
  } else if (!msal.getActiveAccount()) {
    msal.setActiveAccount(msal.getAllAccounts()[0] || null);
  }
  return redirectResult;
});

export async function initializeMicrosoftAuth(): Promise<AuthenticationResult | null> {
  return initialization;
}

export function getMicrosoftAccount(): AccountInfo | null {
  return msal.getActiveAccount() || msal.getAllAccounts()[0] || null;
}

export async function loginWithMicrosoft(): Promise<void> {
  await initialization;
  await msal.loginRedirect({
    scopes: ["openid", "profile", "email", apiScope],
    prompt: "select_account",
  });
}

export async function getMicrosoftAccessToken(): Promise<AuthenticationResult> {
  await initialization;
  const account = getMicrosoftAccount();
  if (!account) {
    throw new Error("Chưa đăng nhập Microsoft.");
  }
  msal.setActiveAccount(account);

  try {
    return await msal.acquireTokenSilent({
      account,
      scopes: [apiScope],
    });
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await msal.acquireTokenRedirect({
        account,
        scopes: [apiScope],
      });
    }
    throw error;
  }
}

export async function logoutMicrosoft(): Promise<void> {
  await initialization;
  await msal.logoutRedirect({
    account: getMicrosoftAccount(),
    postLogoutRedirectUri: redirectUri,
  });
}
