import { UserRepo } from "../repositories/UserRepo";

export const removeVietnameseTones = (str: string): string => {
  return str
    .normalize("NFD") // tách dấu ra khỏi ký tự
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export const generateUsername = async (
  fullName: string,
  userRepo: UserRepo,
): Promise<string> => {
  let baseUsername = removeVietnameseTones(fullName)
    .toLowerCase()
    .replace(/\s+/g, "");

  let username = baseUsername;
  let counter = 0;

  while (await userRepo.findByUsername(username)) {
    counter++;
    username = `${baseUsername}${counter}`;
  }

  return username;
};
