import { PrismaClient } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your username",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials.username || !credentials.password) {
          console.log("Missing required fields");
          return null;
        }

        try {
          console.log(
            "Searching for user with username:",
            // eslint-disable-next-line prettier/prettier
            credentials.username
          );

          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username,
            },
          });

          if (!user) {
            console.log("User not found");
            return null;
          }

          console.log("User found, verifying password");
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            // eslint-disable-next-line prettier/prettier
            user.password
          );

          if (!passwordMatch) {
            console.log("Password does not match");
            return null;
          }

          console.log("Authentication successful");
          return {
            id: user.id.toString(),
            name: user.fullName,
            username: user.username,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/api/auth/signin",
  },
  // Allow flexible URL handling for development
  trustHost: true,
  callbacks: {
    jwt: async ({ user, token }: any) => {
      if (user) {
        token.uid = user.id;
        token.username = user.username;
        token.name = user.name;
      }
      return token;
    },
    session: ({ session, token }: any) => {
      if (session.user) {
        session.user.id = token.uid;
        session.user.username = token.username;
        session.user.name = token.name;
      }
      return session;
    },
  },
};
