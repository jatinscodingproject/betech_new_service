const User = require('../Models/models.customer');

const Customer = async (req, res) => {
    const { phone_number , real_ip } = req.body;
    console.log(req.headers)
    console.log('req.body' , req.body);
    const origin = req.headers.origin || null;
    const referer = req.headers.referer || null;
    // const clientIp =
    //     req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    //     req.headers['x-real-ip'] ||
    //     req.socket.remoteAddress ||
    //     null;  
    
    const rawIp = req.ip;
    const clientIp = rawIp?.startsWith("::ffff:")
            ? rawIp.replace("::ffff:", "")
            : rawIp;
    
    try {
        if (!phone_number) {
            return res.status(400).json({
                message: "Phone number is required"
            });
        }

        const user = await User.findOne({
            where: {
                msisdn: phone_number,
                origin: origin,
                referer: referer,
                client_ip: real_ip,
            }
        });

        const gameon = await Gameon.findOne({
            where : {
                msisdn : phone_number,
                // client_ip : real_ip,
                // origin : "http://gameon.trickso.com/subscribe"
            }
        })

        if (user && gameon) {
            return res.status(200).json({
                message: "Customer already found",
                origin,
                referer,
                client_ip: real_ip
            });
        }

        await User.create({
            msisdn: phone_number,
            origin: origin,
            referer: referer,
            client_ip: real_ip
        });


        return res.status(200).json({
            message: "Customer stored successfully",
            origin,
            referer
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

module.exports = Customer;
