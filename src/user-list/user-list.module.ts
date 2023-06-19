import { Module } from '@nestjs/common';
import { UserListService } from './user-list.service';
import { UserListController } from './user-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserList } from './entities/user-list.entity';
import { MailerService } from 'src/mailer.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      UserList
    ])
  ],
  controllers: [UserListController],
  providers: [UserListService,MailerService]
})
export class UserListModule {}
