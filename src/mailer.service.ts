import { HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
// import { Request,Response } from 'express';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // Configure the transport options
      // For example, for Gmail:
      host:'sandbox.smtp.mailtrap.io',
      port:2525,
      auth: {
        user:'69069aa3f7cdb8',
        pass:'b574195cef43e9',
      },
    });


   // Verify the tran   sporter
   this.transporter.verify()
   .then(() => {
     console.log('Transporter verified successfully');
   })   
   .catch((error) => {
     console.log('Error verifying transporter:', error);
   });

  }

  async sendEmail(to:string,token:string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: 'mohanmahimano23@gmail.com',
        to:to,
        subject:'verifycation mail',
        html: `<h1>Click on the link to verify your account</h1><br/> <p><a href="${process.env.DOMAIN}/verify/?token=${token}">Verify Account</a></p>`,
    });
      console.log('Email sent successfully');
    //   res.status(HttpStatus.OK).json({message:'Check Your Email'})

    } catch (error) { 
      console.log('Error sending email:', error);
      throw error;
    }
  }

  async sendEmailForgetPassword(to:string,token:string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: 'mohanmahimano23@gmail.com',
        to:to,
        subject:'verifycation mail',
        html: `<h1>Click on the link to verify your account</h1><br/> <p><a href="${process.env.DOMAIN}/resetPassword/?token=${token}">Reset Password</a></p>`,
    });
      console.log('Email sent successfully');
    //   res.status(HttpStatus.OK).json({message:'Check Your Email'})

    } catch (error) { 
      console.log('Error sending email:', error);
      throw error;
    }
  }


}
