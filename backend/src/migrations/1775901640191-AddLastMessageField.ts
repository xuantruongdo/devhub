import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastMessageField1775901640191 implements MigrationInterface {
    name = 'AddLastMessageField1775901640191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ADD "lastMessageId" integer`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_de0389f98ed76b16b16a9755423" FOREIGN KEY ("lastMessageId") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_de0389f98ed76b16b16a9755423"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "lastMessageId"`);
    }

}
