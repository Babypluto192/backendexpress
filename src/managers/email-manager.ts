import { mailAdapter } from "../adapters/mail-adapter";
import { userType } from "../types/userType";


interface mailManagerInterface {
  sendRegistrationMail(user:userType): Promise<void>,
  sendRecoveryMail(email: string, user:userType, recoveryCode: string): Promise<boolean>
}
const mailSender = new mailAdapter()
export class mailManager implements mailManagerInterface {
  async sendRegistrationMail(user: userType): Promise<void> {

     await mailSender.sendMail(user.email, "Спасибо за регистрацию", `Подвердите ваш эмэил http://localhost:3000/confirmation?code=${user.mailConfirmation.confirmationCode.code}`)
    
  }

  async sendRecoveryMail(email: string, user:userType, recoveryCode:string): Promise<boolean> {

    const result = await mailSender.sendMail(email, "Сброс пароля", `Сбросьте пароль по этой ссылке http://localhost:3000/recoveryaccess?recoveryCode=${recoveryCode}`)
    
    if(result) {
      return true
    } else {
      return false
    }
  }
}