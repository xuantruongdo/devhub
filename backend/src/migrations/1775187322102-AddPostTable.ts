import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostTable1775187322102 implements MigrationInterface {
    name = 'AddPostTable1775187322102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_like" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "postId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_754a5e1d4e513c739e9c39a8d79" UNIQUE ("userId", "postId"), CONSTRAINT "PK_0e95caa8a8b56d7797569cf5dc6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_754a5e1d4e513c739e9c39a8d7" ON "post_like" ("postId", "userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_909fc474ef645901d01f0cc066" ON "post_like" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_789b3f929eb3d8760419f87c8a" ON "post_like" ("postId") `);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "content" text NOT NULL, "authorId" integer NOT NULL, "postId" integer NOT NULL, "parentId" integer, "likeCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e3aebe2bd1c53467a07109be59" ON "comment" ("parentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_276779da446413a0d79598d4fb" ON "comment" ("authorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_94a85bb16d24033a2afdd5df06" ON "comment" ("postId") `);
        await queryRunner.query(`CREATE TABLE "post_share" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "postId" integer NOT NULL, "content" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_77619741bae0a19103e9af87f46" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_68c00adaed141c9e477a99e225" ON "post_share" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_489f6ed6c502cd6e97a7cb2965" ON "post_share" ("postId") `);
        await queryRunner.query(`CREATE TYPE "public"."post_visibility_enum" AS ENUM('public', 'private')`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "authorId" integer NOT NULL, "content" text, "images" jsonb, "visibility" "public"."post_visibility_enum" NOT NULL DEFAULT 'public', "likeCount" integer NOT NULL DEFAULT '0', "commentCount" integer NOT NULL DEFAULT '0', "shareCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "sharedPostId" integer, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a80ca3bf4ca3711c488cb82cf7" ON "post" ("visibility") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb91bea2d37140a877b775e6b2" ON "post" ("createdAt") `);
        await queryRunner.query(`ALTER TABLE "user" ADD "followerCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "followingCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "postCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user" ("username") `);
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_e11e649824a45d8ed01d597fd9" ON "user" ("createdAt") `);
        await queryRunner.query(`ALTER TABLE "post_like" ADD CONSTRAINT "FK_909fc474ef645901d01f0cc0662" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_like" ADD CONSTRAINT "FK_789b3f929eb3d8760419f87c8a9" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_e3aebe2bd1c53467a07109be596" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_share" ADD CONSTRAINT "FK_68c00adaed141c9e477a99e2250" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_share" ADD CONSTRAINT "FK_489f6ed6c502cd6e97a7cb2965c" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_0e7cbc85b452229a89e3c551720" FOREIGN KEY ("sharedPostId") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_0e7cbc85b452229a89e3c551720"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`);
        await queryRunner.query(`ALTER TABLE "post_share" DROP CONSTRAINT "FK_489f6ed6c502cd6e97a7cb2965c"`);
        await queryRunner.query(`ALTER TABLE "post_share" DROP CONSTRAINT "FK_68c00adaed141c9e477a99e2250"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_e3aebe2bd1c53467a07109be596"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`);
        await queryRunner.query(`ALTER TABLE "post_like" DROP CONSTRAINT "FK_789b3f929eb3d8760419f87c8a9"`);
        await queryRunner.query(`ALTER TABLE "post_like" DROP CONSTRAINT "FK_909fc474ef645901d01f0cc0662"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e11e649824a45d8ed01d597fd9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78a916df40e02a9deb1c4b75ed"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "postCount"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "followingCount"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "followerCount"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb91bea2d37140a877b775e6b2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a80ca3bf4ca3711c488cb82cf7"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TYPE "public"."post_visibility_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_489f6ed6c502cd6e97a7cb2965"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_68c00adaed141c9e477a99e225"`);
        await queryRunner.query(`DROP TABLE "post_share"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94a85bb16d24033a2afdd5df06"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_276779da446413a0d79598d4fb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3aebe2bd1c53467a07109be59"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_789b3f929eb3d8760419f87c8a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_909fc474ef645901d01f0cc066"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_754a5e1d4e513c739e9c39a8d7"`);
        await queryRunner.query(`DROP TABLE "post_like"`);
    }

}
