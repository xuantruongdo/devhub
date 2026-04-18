import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { PostLike } from "./PostLike";
import { Comment } from "./Comment";
import { PostShare } from "./PostShare";

export enum PostVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

@Entity()
@Index(["authorId", "createdAt"])
@Index(["visibility", "createdAt"])
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  authorId!: number;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "authorId" })
  author!: User;

  @Column("text", { nullable: true })
  content?: string;

  @Column({ type: "jsonb", nullable: true })
  images?: string[];

  @Column({
    type: "enum",
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  @Index()
  visibility!: PostVisibility;

  @ManyToOne(() => Post, {
    nullable: true,
    onDelete: "SET NULL",
  })
  sharedPost?: Post;

  @Column({ default: 0 })
  likeCount!: number;

  @Column({ default: 0 })
  commentCount!: number;

  @Column({ default: 0 })
  shareCount!: number;

  @OneToMany(() => PostLike, (like) => like.post)
  likes!: PostLike[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];

  @OneToMany(() => PostShare, (share) => share.post)
  shares!: PostShare[];

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
