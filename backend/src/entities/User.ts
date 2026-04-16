import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
} from "typeorm";

import { Post } from "./Post";
import { PostLike } from "./PostLike";
import { Comment } from "./Comment";
import { PostShare } from "./PostShare";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @Index()
  username!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column({ nullable: true })
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  birthday?: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({ default: false })
  isActive!: boolean;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  lastLogin?: Date;

  @ManyToMany(() => User, (user) => user.followings)
  @JoinTable({
    name: "user_followers",
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "followerId", referencedColumnName: "id" },
  })
  followers!: User[];

  @ManyToMany(() => User, (user) => user.followers)
  followings!: User[];

  @Column({ default: 0 })
  followerCount!: number;

  @Column({ default: 0 })
  followingCount!: number;

  @Column({ default: 0 })
  postCount!: number;

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  @OneToMany(() => PostLike, (like) => like.user)
  likes!: PostLike[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments!: Comment[];

  @OneToMany(() => PostShare, (share) => share.user)
  shares!: PostShare[];

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
