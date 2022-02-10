import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { Tweet, TweetDocument } from './schemas/tweet.schema';

@Injectable()
export class TweetsService {
  constructor(
    @InjectModel(Tweet.name)
    private tweetModel: Model<TweetDocument>,
  ) {}

  create(createTweetDto: CreateTweetDto) {
    return this.tweetModel.create(createTweetDto);
  }

  findAll(
    { offset, limit }: { offset: number; limit: number } = {
      offset: 0,
      limit: 50,
    },
  ) {
    return this.tweetModel
      .find()
      .skip(offset)
      .limit(limit)
      .sort({ CreatedAt: -1 });
  }

  findOne(id: string) {
    return this.tweetModel.findOne({ _id: id });
  }

  update(id: string, updateTweetDto: UpdateTweetDto) {
    return this.tweetModel.findOneAndUpdate({ _id: id }, updateTweetDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.tweetModel.deleteOne({ _id: id });
  }
}
