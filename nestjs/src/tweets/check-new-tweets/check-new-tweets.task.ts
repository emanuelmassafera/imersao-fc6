import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { TweetsService } from '../tweets.service';
import { Cache } from 'cache-manager';
import { Queue } from 'bull';

@Injectable()
export class CheckNewTweetsTask {
  private limit = 10;

  constructor(
    private tweetService: TweetsService,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
    @InjectQueue('emails')
    private emailsQueue: Queue,
  ) {}

  @Interval(5000)
  async handle() {
    console.log('Procurando tweets...');

    let offset = await this.cache.get<number>('tweet-offset');
    offset = offset === undefined || offset === null ? 0 : offset;
    console.log(`Offset: ${offset}`);

    const tweets = await this.tweetService.findAll({
      offset,
      limit: this.limit,
    });
    console.log(`Tweets encontrados: ${tweets.length}`);

    if (tweets.length === this.limit) {
      console.log(`Mais ${this.limit} tweets encontrados`);

      await this.cache.set('tweet-offset', offset + this.limit, {
        ttl: 1 * 60 * 60,
      });

      console.log('Adicionando job de envio de e-mail na fila');
      this.emailsQueue.add({});
    }
  }
}
