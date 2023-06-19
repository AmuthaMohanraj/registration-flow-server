import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus, Put } from '@nestjs/common';
import { UserListService } from './user-list.service';
import { CreateUserListDto } from './dto/create-user-list.dto';
import { UpdateUserListDto } from './dto/update-user-list.dto';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt';
import { ApiTags } from '@nestjs/swagger';
import { Hash } from 'crypto';
import { MailerService } from 'src/mailer.service';
import * as jwt from 'jsonwebtoken';
import { log } from 'console';
import { emitWarning } from 'process';

@Controller('user-list')
@ApiTags('user-list')

export class UserListController {
  constructor(private readonly userListService: UserListService,private readonly mailerService: MailerService) { }

  @Post('signup')
  async create(@Req() req: Request, @Res() res: Response, @Body() createUserListDto: CreateUserListDto) {

    try {
    const { email, password, username } = createUserListDto;
    const payload = { username: username, email: email };
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });

      const emailId = await this.userListService.checkEmailExist(email);

      if (emailId) {
        const isVerified = emailId;
        if (isVerified.isVerified === false) {
          // console.log(isVerified,'not verified user');
          // console.log(email,'emailid')
          await this.mailerService.sendEmail(email, token)       //send mail
          res.status(HttpStatus.OK).json({
            message: 'check your Mail',
            status: 200
          })
          return
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            message: 'something went wrong'
          });
          return;
        }

      } else {
        const hashedPassword = await this.hashPassword(password);
        createUserListDto.password = hashedPassword;
        await this.userListService.create(createUserListDto)
        await this.mailerService.sendEmail(email, token)             //send mail
        res.status(HttpStatus.OK).json({
          message: 'check your Mail',
          status: 200
        })
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'error',
        status: 500,
      });
      console.log(error);
    }
  }

  // verify account
  @Put('verify')
  async updateVerified(@Req() req: Request, @Res() res: Response, @Body() updateUserListDto: any) {
    try {
      const { token } = updateUserListDto
      if (token) {
        jwt.verify(token, process.env.SECRET_KEY, async (err: any, decoded: any) => {
          console.log(token, 'return token')
          if (err) {
            // Invalid token
            res.status(HttpStatus.BAD_REQUEST).json({
              message: 'Invalid token',
              status: 500,
            });
          } else {
            // Valid token, check expiration time
            const currentTimestamp = Math.floor(Date.now() / 1000); // Get the current timestamp in seconds
            if (decoded.exp && currentTimestamp > decoded.exp) {
              // Token has expired
              res.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Token has expired',
                status: HttpStatus.UNAUTHORIZED,
              });
            } else {
              // Token is valid and not expired, perform database update
              const { email } = decoded; // Extract the userId from the token payload
              // Perform your database update logic here, e.g., set isVerified = true for the user with userId
              let userEmail = await this.userListService.checkEmailExist(email);  //get user id

              if (userEmail) {
                // console.log(userEmail,'email')
                let isVerifiedEmail = userEmail;
                let id = isVerifiedEmail.id;
                await this.userListService.verifiedUser(id, true);

                res.status(HttpStatus.OK).json({
                  message: 'Token verified and database updated',
                  status: HttpStatus.OK,
                });
              }
            }
          }
        });
      }

      else {
        console.log("token is empty")
      }

    } catch (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'error',
        status: 500
      })

    }
  }

  //signin account
  @Post('login')
  async findAll(@Req() req: Request, @Res() res: Response, @Body() body: CreateUserListDto) {
    try {
      console.log('entered');
      console.log(body, 'body Data');

      const { email, password } = body;
      const user = await this.userListService.findOne(email);

      if (user) {
        console.log(user, 'user data');
      } else {
        console.log('User not found');
        res.status(HttpStatus.BAD_REQUEST).json({
          message:'something went wrong'
        })
        return
      }

      let getData = user;
      // console.log(getData, 'getData');

      const isMatch = bcrypt.compareSync(password, getData.password);

      if (getData.isVerified == true) {

         if(getData.blocked==true){

            const blockedTimeStr = getData.blockedTime;
            const blockedTime = new Date(blockedTimeStr);
            const currentTime = new Date();
            const elapsedTime = currentTime.getTime() - blockedTime.getTime();
            const elapsedHours = elapsedTime / (1000 * 60 * 60); // Convert elapsed time to hours
  
            if (elapsedHours >= 3) {
              await this.userListService.blockedUser(getData.id,false,null)  //unblock user after block time
            } else {
              // Display error message or take appropriate action
              // User is still blocked
              res.status(HttpStatus.BAD_REQUEST).json({
                message: 'User is still blocked',
                status: 500,
              })
               return 
            }
         
         }

        if (getData.blocked == false) {
          if (isMatch) {
            await this.userListService.updateAttempsCount(getData.id, 0)  //update attempts count=0

            const tokenGenrate = { username: getData.username, email: getData.email }
            //  console.log(tokenGenrate,'token')
            const token = jwt.sign(tokenGenrate, process.env.SECRET_KEY, { expiresIn: '1h' });
            console.log(true);
            res.status(HttpStatus.OK).json({
              message: 'login successful',
              status: 200,
              token: token
            })
          } else {
            console.log(false);
            await this.userListService.updateAttempsCount(getData.id, getData.attempts + 1)  //update attempts count 
            const userCheck = await this.userListService.findOne(email)
            if (userCheck.attempts >= 3) {
              const currentDate = new Date();
              console.log(currentDate, 'date');
              await this.userListService.blockedUser(getData.id, true, currentDate)
              res.status(HttpStatus.BAD_REQUEST).json({                   //update blocked,blockedTime 
                message: 'blocked',
                status: 500
              })
            } else {
              res.status(HttpStatus.BAD_REQUEST).json({
                message: 'wrong password',
                status: 500
              })
            }

          }
        } 
      } else {
        res.status(HttpStatus.OK).json({
          message: "you don't have account create account",
          status: 500,
        })
      }
    } catch (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'error',
        status: 500
      })
    }
  }

  // forgotPassword
  @Put('forgotPassword')
  async forget(@Req() req: Request, @Res() res: Response, @Body() body:any) {   
     try {
      const {email}=body;
      console.log(email,'email da')
      const getData=await this.userListService.checkEmailExist(email)  //check email exist or not
      if (getData){
        console.log(getData, 'user data');
      } else {
        console.log('User not found');
        res.status(HttpStatus.BAD_REQUEST).json({
          message:'something went wrong'
        })
        return
      } 
       
      // console.log(getData,'geData');
     const payload={email:getData.email,username:getData.username}
      const token = jwt.sign(payload,process.env.SECRET_KEY, { expiresIn: '1h' });
       if(getData){
          if(getData.isVerified==true){
            await this.mailerService.sendEmailForgetPassword(email, token)       //send mail go to resend password
            res.status(HttpStatus.OK).json({
              message:'check your mail reset password',
              status:200
            })
            console.log('token',token);
            
          }else{
            await this.mailerService.sendEmail(email, token)     //send mail go to check verify user
            res.status(HttpStatus.OK).json({
              message:'check your mail verify link',
              status:200
            })
          }          
       }else{
        res.status(HttpStatus.BAD_REQUEST).json({
          message:'something went wrong',
          status:500
       })
       }
     } catch (error) {
       res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:'error',
        status:400
       })
       console.log(error,'err')
     }

}


@Put('resetPassword')
async resetPassword(@Req() req:Request,@Res() res:Response,@Body() body:any){
 try {
  const {token,password}=body;

  if (token) {
    console.log('entered')
    jwt.verify(token, process.env.SECRET_KEY, async (err: any, decoded: any) => {
      console.log(token, 'return token reset password')
      if (err) {
        // Invalid token
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Invalid token',
          status: 500,
        });
      } else {
        // Valid token, check expiration time
        const currentTimestamp = Math.floor(Date.now() / 1000); // Get the current timestamp in seconds
        if (decoded.exp&& currentTimestamp > decoded.exp) {
          // Token has expired
          res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Token has expired',
            status: HttpStatus.UNAUTHORIZED,
          });
             return;
        } else {
          // Token is valid and not expired, perform database update
          const { email } = decoded; // Extract the userId from the token payload
          // Perform your database update logic here, e.g., set isVerified = true for the user with userId
            let userEmail = await this.userListService.checkEmailExist(email);  //get user id
          if (userEmail){
            // console.log(userEmail,'email')
            let isVerifiedEmail = userEmail;
            let id = isVerifiedEmail.id;
            const hashedPassword = await this.hashPassword(password);        //password hash function
            this.userListService.resetPassordUpdate(id,hashedPassword)        //reset successful
            res.status(HttpStatus.OK).json({
              message:'password reset successful',
              status:200
            })
            console.log('password reset successful');
            
          }else{
            console.log('email not exits')
          }
        }
      } 
      }
      
    )}

 } catch (error) {
   res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message:'error',
    status:500
   })
 }
}

  @Post('date')
  async createFun(@Param('id') id: string, @Req() req: Request, @Res() res: Response, @Body() count: number) {
  }
  // @Put('/:id')
  // async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response, @Body() count:number) {
  //   await this.userListService.update(+id, count);
  // }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response,) {
    await this.userListService.remove(+id);
  }


  // hashPassword function
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Number of salt rounds for hashing
    return bcrypt.hash(password, saltRounds);
  }

}