import { Injectable } from '@nestjs/common';
import { CreateUserListDto } from './dto/create-user-list.dto';
import { UpdateUserListDto } from './dto/update-user-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserList } from './entities/user-list.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserListService {

  constructor(@InjectRepository(UserList) private readonly userListRepo: Repository<UserList>) { }


  // check Email Exist or not
  async checkEmailExist(email:string) {
    return await this.userListRepo.findOne(
      {
        select:['id','username','email','isVerified'],
        where:{email:email}
      }
    )
  }

  // update verifiedUser
  async verifiedUser(id:number,isVerified:boolean){
    await this.userListRepo.update(id,{isVerified:isVerified})
  }

  // signup user
  async create(createUserListDto: CreateUserListDto) {
    await this.userListRepo.save(createUserListDto)
  }

  // get all users
  async findAll() {
    return await this.userListRepo.find(
      {
        select: ['id', 'username', 'email'],
        where: { isActive: true }
      }
    );
  }

  // get one user check id,username,password,email,blocked,attempts,isVerified
  async findOne(email:string) {
    return await this.userListRepo.findOne(
      {
        select: ['id', 'username','password', 'email','blocked','blockedTime','attempts','isVerified'],
        where: {email:email}
      }
    );
  }

  // update user wrong password attempts increments 
  async updateAttempsCount(id: number, count:number) {
    await this.userListRepo.update(id,{attempts:count})
  }

 // update user wrong password attempts increments 
 async blockedUser(id: number,blockedUser:boolean,blockedTime:Date) {
  await this.userListRepo.update(id,{blocked:blockedUser,blockedTime:blockedTime})
}

// resetPassordUpdate 
async resetPassordUpdate(id:number,hashPassword:string){
  await this.userListRepo.update(id,{password:hashPassword})
}

  // delete user
  async remove(id: number) {
    await this.userListRepo.softDelete(id)
  }

}
