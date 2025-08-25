import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function buildPromptWithUserContext(
  content: string,
  username: string,
) {
  return new Promise<string>((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve(`${content}\n\n[User: ${username}] [Location: Unknown]`);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve(
          `${content}\n\n[User: ${username}] [Location: lat:${latitude}, lon:${longitude}]`,
        );
      },
      (error) => {
        console.warn("Geolocation error:", error);
        resolve(`${content}\n\n[User: ${username}] [Location: Unknown]`);
      },
    );
  });
}
