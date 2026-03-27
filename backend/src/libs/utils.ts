import { UserRepo } from "../repositories/UserRepo";

export const generateUsername = async (
  fullName: string,
  userRepo: UserRepo,
): Promise<string> => {
  let baseUsername = fullName.toLowerCase().replace(/\s+/g, "");
  let username = baseUsername;
  let counter = 0;

  while (await userRepo.findByUsername(username)) {
    counter++;
    username = `${baseUsername}${counter}`;
  }

  return username;
};
