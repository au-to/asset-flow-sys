import { IsNotEmpty, IsString } from 'class-validator';

export class RejectDto {
  @IsString()
  @IsNotEmpty({ message: '驳回原因不能为空' })
  reason!: string;
}
