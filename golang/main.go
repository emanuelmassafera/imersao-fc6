package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"github.com/emanuelmassafera/imersao-fc6/email"
	"github.com/emanuelmassafera/imersao-fc6/kafka"
	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	gomail "gopkg.in/mail.v2"
)

func main() {
	var emailCh = make(chan email.Email)
	var msgChan = make(chan *ckafka.Message)

	d := gomail.NewDialer(
		"smtp.mailtrap.io",
		2525,
		"a98aaa0c1104ab",
		"eefcec79573a0d",
	)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	es := email.NewMailSender()
	es.From = "full@cycle.com"
	es.Dialer = d

	for i := 1; i <= 2; i++ {
		go es.Send(emailCh, i)
	}

	configMapConsumer := &ckafka.ConfigMap{
		"bootstrap.servers": "kafka:9094",
		"client.id": "goapp",
		"group.id":  "goapp1",
		"session.timeout.ms": 45000,
	}
	topics := []string{"emails"}
	consumer := kafka.NewConsumer(configMapConsumer, topics)
	go consumer.Consume(msgChan)

	fmt.Println("Consumindo mensagens do kafka")
	for msg := range msgChan {
		var input email.Email
		json.Unmarshal(msg.Value, &input)
		emailCh <- input
	}
}
