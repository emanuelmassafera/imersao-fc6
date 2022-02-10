import { NextPage } from "next"
import useSWR from "swr"
import { Title } from "../components/title"
import http from "../utils/http"
import { Tweet as TweetModel } from "../utils/models"
import { Tweet } from "../components/tweet"

const fetcher = (url: string) => http.get(url).then(res => res.data)

const TweetsPage: NextPage = () => {
  const {data: tweets} = useSWR<TweetModel[]>("tweets", fetcher, { fallbackData: [], refreshInterval: 5000 })

  return (
    <div>
      <Title>Tweets</Title>
      {tweets?.map((t, key) => (
        <Tweet key={key} tweet={t} />
      ))}
    </div>
  )
}

export default TweetsPage