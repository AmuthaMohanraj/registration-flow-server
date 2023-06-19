import {ApiProperty} from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator';

export class CreateUserListDto {

    @ApiProperty()
    // @IsNotEmpty()

    // @Length(2,20)
     username:string

     @IsNotEmpty()
     @ApiProperty()
     email:string

     @IsNotEmpty()
     @ApiProperty()
     password:string
     
}
