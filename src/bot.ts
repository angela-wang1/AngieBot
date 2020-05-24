// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AzureKeyCredential, TextAnalyticsClient } from '@azure/ai-text-analytics';
import { ActivityHandler, MessageFactory, BotFrameworkHttpClient, BrowserLocalStorage, ActivityTypes } from 'botbuilder';

const textAnalyticsClient = new TextAnalyticsClient(
    process.env.CogSvcs_Endpoint,
    new AzureKeyCredential (process.env.CogSvcs_Key)
)
export class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
           //sent "typing"
           await context.sendActivity({ //always good practice to type when a msg is recieved
               type: ActivityTypes.Typing
           });
           
            //const replyText = `Echo: ${ context.activity.text }`;
            //await context.sendActivity(MessageFactory.text(replyText, replyText));
            // By calling next() you ensure that the next BotHandler is run.
            // await next();
            const messageText = context.activity.text;
           if (messageText.toLowerCase()=='help'){
            const helpText = 'Confused? How about I give you a tour first?'   
            context.sendActivity(MessageFactory.text(helpText, helpText))
           }
           else {
               //const echoResponse = 'Echo: ' + messageText;
               //await context.sendActivity (MessageFactory.text(echoResponse, echoResponse));
               const documents = [messageText];
               const response = await textAnalyticsClient.analyzeSentiment(documents); //you can include any serivce here ANY

               const responseItem = response[0] as any;
               switch (responseItem.sentiment){
                   case 'positive':
                       await context.sendActivity('Great News!');
                       break;
                    case 'neutral':
                        await context.sendActivity('oKAY then');
                        break;
                    case 'negative':
                        await context.sendActivity('sorry to hear that :(')
               }
               await context.sendActivity ('How are you doing now?')
            }
           await next(); //always await when using send activity
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = "Hi there! I'm AngieBot, welcome! I'm here to show you around. Where would you like to start first? Or perhaps would you like a tour?"; //give examples of what messages can be returned 
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) { //"who's now joined the conference call?", makes sure the bot isn't replying to itself
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}
