import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserListModule } from './user-list/user-list.module';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    
    
    TypeOrmModule.forRoot({
      type:'mysql',
      host:process.env.DATABASE_HOST,
      port:3306,
      username:process.env.DATABASE_USER,
      password:process.env.DATABASE_PASSWORD,
      database:process.env.DATABASE_NAME,
      // synchronize: true,
      autoLoadEntities: true,
    }),
    UserListModule,
  ],
  controllers: [AppController],
  providers: [AppService,MailerService],
})
export class AppModule {}
