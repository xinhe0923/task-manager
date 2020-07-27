const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'357042870@qq.com',
        subject:'thaks for joining in',
        text:`welcome to the app, ${name}. Let me how you get along`
    })
}

const sendCancelEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:"357042870@qq.com",
        subject:'cancelation',
        text:`sad to see you leave, ${name}`

    })
}

module.exports={
    sendWelcomeEmail,
    sendCancelEmail
    }