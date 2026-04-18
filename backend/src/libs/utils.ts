import { Post } from "../entities/Post";
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

/**
 * Tính điểm (ranking score) cho một post trong feed
 *
 * Mục tiêu:
 * - Ưu tiên post mới (recency)
 * - Ưu tiên post có tương tác cao (engagement)
 * - Ưu tiên post từ người mà user đang follow
 * - Ưu tiên nhẹ post của chính user
 *
 * Logic:
 * 1. Recency:
 *    - Post càng mới → điểm càng cao
 *    - Dùng công thức decay: 100 / (hours + 2)
 *
 * 2. Engagement:
 *    - likeCount * 1
 *    - commentCount * 2 (quan trọng hơn like)
 *    - shareCount * 3 (quan trọng nhất)
 *
 * 3. Follow boost:
 *    - Nếu post từ người user follow → +50 điểm
 *
 * 4. Own post boost:
 *    - Nếu là post của chính user → +20 điểm
 *
 * @param post - bài viết cần tính điểm
 * @param currentUserId - id của user hiện tại
 * @param followingsSet - tập hợp id những người user đang follow
 * @returns score (số càng cao → càng ưu tiên hiển thị)
 */
export function scorePost(
  post: Post,
  currentUserId: number,
  followingsSet: Set<number>,
) {
  let score = 0;

  // 1. recency (ưu tiên bài mới)
  const hours = (Date.now() - new Date(post.createdAt).getTime()) / 36e5;
  score += 100 / (hours + 2);

  // 2. engagement (tương tác)
  score += post.likeCount * 1;
  score += post.commentCount * 2;
  score += post.shareCount * 3;

  // 3. boost nếu là người đang follow
  if (followingsSet.has(post.authorId)) {
    score += 50;
  }

  // 4. boost nhẹ nếu là bài của chính user
  if (post.authorId === currentUserId) {
    score += 20;
  }

  return score;
}

/**
 * Encode cursor để gửi về client (pagination)
 *
 * Mục tiêu:
 * - Biến thông tin phân trang (score + postId)
 *   thành một chuỗi an toàn (base64)
 *
 * Tại sao cần:
 * - Tránh lộ logic sorting
 * - Tránh client chỉnh sửa cursor
 * - Dễ truyền qua query string
 *
 * @param score - score của post cuối cùng trong page
 * @param postId - id của post cuối cùng
 * @returns string base64 (cursor)
 */
export function encodeCursor(score: number, postId: number) {
  return Buffer.from(JSON.stringify({ score, postId })).toString("base64");
}

/**
 * Decode cursor từ client gửi lên
 *
 * Mục tiêu:
 * - Lấy lại thông tin phân trang (score + postId)
 *   để biết bắt đầu từ đâu khi query tiếp
 *
 * Logic:
 * - Decode base64 → JSON
 * - Nếu lỗi (cursor không hợp lệ) → trả về null
 *
 * @param cursor - string base64 từ client
 * @returns { score, postId } | null
 */
export function decodeCursor(cursor?: string) {
  if (!cursor) return null;

  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString());
  } catch {
    return null;
  }
}
