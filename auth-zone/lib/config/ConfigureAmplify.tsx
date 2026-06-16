"use client";

import { Amplify } from "aws-amplify";

// OAuth redirect targets must EXACTLY match the "Allowed callback/sign-out URLs"
// configured on the Cognito app client. We default to the current origin so the
// same build works on localhost and in production; override via env if needed.
const origin =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

const redirectSignIn = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN ?? `${origin}/login`;
const redirectSignOut = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_OUT ?? `${origin}/login`;

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "us-east-2_YiR4gy9YE",
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "12aqfnia1vr07rdc9hghsadtv3",
        loginWith: {
          oauth: {
            // Cognito Hosted UI domain WITHOUT the https:// prefix, e.g.
            // "your-prefix.auth.us-east-2.amazoncognito.com"
            domain:
              process.env.NEXT_PUBLIC_COGNITO_DOMAIN ??
              "us-east-2yir4gy9ye.auth.us-east-2.amazoncognito.com",
            // "aws.cognito.signin.user.admin" is required for fetchUserAttributes()
            // (Cognito GetUser API). The classic SRP login grants it automatically,
            // but the OAuth/Hosted UI flow only gets the scopes requested here.
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
