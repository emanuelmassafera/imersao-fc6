import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Producer } from '@nestjs/microservices/external/kafka.interface';
import { Job } from 'bull';
import { MailListService } from './mail-list.service';

@Processor('emails')
export class SendMailTweetsJob {
  constructor(
    private mailListService: MailListService,
    @Inject('KAFKA_PRODUCER')
    private kafkaProducer: Producer,
    private configService: ConfigService,
  ) {}

  @Process()
  async handle(job: Job) {
    const mailList = await this.mailListService.findOne();
    console.log(`E-mails: ${mailList.emails}`);

    const link = this.configService.get('NEXT_HOST');

    console.log('Enviando dados para o Kafka');
    await this.kafkaProducer.send({
      topic: 'emails',
      messages: [
        {
          key: 'emails',
          value: JSON.stringify({
            subject: 'Novos tweets encontrados!',
            body: `Acesse o link <a href="${link}/tweets">clicando aqui</a>`,
            emails: mailList.emails,
          }),
        },
      ],
    });
  }
}
