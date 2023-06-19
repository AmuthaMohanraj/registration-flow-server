import { PartialType } from '@nestjs/mapped-types';
import { CreateUserListDto } from './create-user-list.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserListDto extends PartialType(CreateUserListDto) {

    @ApiProperty()
    id: number

    @ApiProperty()
    username: string

    @ApiProperty()
    email: string;

    @ApiProperty()
    password:string;

    @ApiProperty()
    isVerified: boolean

    @ApiProperty()
    token:string

}
