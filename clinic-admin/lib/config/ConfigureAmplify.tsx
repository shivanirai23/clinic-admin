"use client";

import { Amplify } from "aws-amplify";

const origin =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

const redirectSignIn = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN ?? `${origin}/login`;
const redirectSignOut = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_OUT ?? `${origin}/login`;

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "",
        loginWith: {
          oauth: {
            domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "",
            scopes: ["openid", "email", "profile", "aws.cognito.signin.user.admin"],
            redirectSignIn: [redirectSignIn],
            redirectSignOut: [redirectSignOut],
            responseType: "code",
            providers: ["Google"],
          },
        },
      },
    },
  },
);

export function ConfigureAmplify() {
  return null;
}
