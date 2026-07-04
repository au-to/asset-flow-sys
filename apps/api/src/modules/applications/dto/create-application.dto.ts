import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssetCategory } from '@prisma/client';

export class ApplicationItemDto {
  @IsEnum(AssetCategory)
  category!: AssetCategory;

  @IsString()
  @IsNotEmpty({ message: '资产名称不能为空' })
  assetName!: string;

  @IsInt({ message: '数量必须为整数' })
  @Min(1, { message: '数量必须大于0' })
  quantity!: number;
}

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty({ message: '申请原因不能为空' })
  @MaxLength(100, { message: '申请原因不能超过100字' })
  reason!: string;

  @IsArray()
  @ArrayMinSize(1, { message: '至少添加一条资产明细' })
  @ValidateNested({ each: true })
  @Type(() => ApplicationItemDto)
  items!: ApplicationItemDto[];
}
