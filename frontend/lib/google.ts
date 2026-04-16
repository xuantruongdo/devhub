import { GoogleTokenResponse, GoogleUserProfile } from "@/types/auth";

export const googleOAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
  scopes: ["openid", "profile", "email"],
};

export const getGoogleOAuthURL = () => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: googleOAuthConfig.redirectUri,
    client_id: googleOAuthConfig.clientId,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: googleOAuthConfig.scopes.join(" "),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};

export const getGoogleTokens = async (
  code: string,
): Promise<GoogleTokenResponse> => {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: googleOAuthConfig.clientId,
    client_secret: googleOAuthConfig.clientSecret,
    redirect_uri: googleOAuthConfig.redirectUri,
    grant_type: "authorization_code",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(values).toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to get Google tokens");
  }

  return response.json();
};

export const getGoogleUserProfile = async (
  access_token: string,
): Promise<GoogleUserProfile> => {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to get Google user profile");
  }

  return response.json();
};
