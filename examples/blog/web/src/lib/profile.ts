import { computed, task } from "nanostores";
import { type Client, FetchError } from "trailbase";

import type { NewProfile } from "@schema/new_profile";
import type { Profile } from "@schema/profile";
import { $client } from "@/lib/client";

export async function createProfile(
  client: Client,
  username: string,
): Promise<void> {
  await client.records<NewProfile>("profiles").create({
    user: client.user()?.id ?? "",
    username,
  });
}

export type ProfileState = {
  profile: Profile | undefined;
  missingProfile: boolean;
};

export const $profile = computed([$client], (client) =>
  task(async (): Promise<ProfileState> => {
    const userId = client?.user()?.id;
    if (client && userId) {
      try {
        const profile = await client
          .records<Profile>("profiles_view")
          .read(userId);
        return {
          profile,
          missingProfile: false,
        };
      } catch (err) {
        if (err instanceof FetchError && err.status === 404) {
          return {
            profile: undefined,
            missingProfile: true,
          };
        }
        console.debug(err);
      }
    }

    return {
      profile: undefined,
      missingProfile: false,
    };
  }),
);
