const uuid = require("uuid");
const moment = require("moment");
const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const VNnum2words = require("vn-num2words");
const axios = require("axios");

let shippingInfo = null;
let products = {};
let receiverInfo = null;
let orderId = null;
let email;
let customer_id, customer_name;
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

const createMailOptions = (toEmail, filePath, order) => {
  return {
    from: "nguyenquangloi2666@gmail.com",
    to: toEmail,
    subject: "Đơn hàng của bạn đã được xác nhận",
    html: `
    <h1>Kính chào quý khách</h1>
    <p>TDTU Mobile gửi đến quý khách hóa đơn điện tử cho đơn hàng ${order._id} của quý khách.</p>
    <p>Quý khách vui lòng kiểm tra hóa đơn VAT bằng cách tải file đính kèm và mở file trực tiếp từ thư mục đã tải về trong máy tính.</p>
    <h2 style ="font-weith: bold">Lưu ý :</h2>
    <ul>
        <li>Toàn bộ hàng hóa và dịch vụ được bán ra bởi TDTU MOBILE được phát hành hóa đơn VAT ngay tại thời điểm xuất bill bán hàng cho quý khách hàng.</li>
        <li>Quý khách hàng vui lòng kiểm tra thông tin hóa đơn, mọi sai sót trên hóa đơn sẽ được TDTU MOBILE hỗ trợ thay đổi thông tin cho Quý Khách Hàng TRONG CÙNG NGÀY.</li>
    </ul>
    <h2 style ="font-weith: bold">Thông tin đơn hàng:</h2>
    <table>
                <tr>
                    <td>Thông tin thanh toán</td>
                    <td style="padding-left: 40px;">Địa chi giao hàng</td>
                    <td style="padding-left: 40px;">Mã đơn hàng</td>
                </tr>
                <tr>
                    <td> ${toEmail}</td>
                    <td style="padding-left: 40px;">${order.receiver_info}</td>
                    <td style="padding-left: 40px;">${order._id}</td>
                </tr>
            </table>
    <h2 style ="font-weith: bold">Hóa đơn đơn hàng được đính ở tệp đính kèm</h2>
    <p>Trân trọng cảm ơn quý khách đã tin tưởng và ủng hộ TDTU MOBILE</p>
    `,
    attachments: [
      {
        filename: `invoice_${order._id}.pdf`,
        path: filePath,
        contentType: "application/pdf",
      },
    ],
  };
};

const ipnMoMo = async (req, res) => {
  try {
    console.log("ipnMoMoRêcived");
    const code = req.body.resultCode;
    const message = req.body.message;
    const amount = req.body.amount;
    const transId = req.body.transId;
    customer_id = req.body.customer_id || req.query.customer_id;
    customer_name = req.body.customer_name || req.query.customer_name;
    email = req.body.email || req.query.email;
    console.log(req.body);
    if (code == 0 && message == "Successful.") {
      console.log(products);
      const resUpdateStock = await axios.get(
        "http://localhost:3456/api/product/updateStock",
        { params: { products: products } }
      );

      console.log("stockpd: ", resUpdateStock.data);
      const resCreateOrder = await axios.post(
        "http://localhost:3458/api/order/create-order",
        {
          customer_id: customer_id,
          customer_name: customer_name,
          products: resUpdateStock.data.productsWithSerialNumbers,
          total_amount: amount * 100,
          payment_method: "momo",
          receiver_info: receiverInfo,
          order_type: "web",
          order_status: "processing",
          transIdPay: transId,
        }
      );
      orderId = resCreateOrder.data._id;
      const resCreateOrderGHN = await axios.post(
        "http://localhost:3458/api/order/create-order-ghn",
        {
          order: resCreateOrder.data,
          codAmount: 0,
        }
      );

      res.json({ success: true });
    }
  } catch (error) {
    console.log(error);
  }
};

const getMomoReturnPage = async (req, res) => {
  console.log("orderId: ", orderId);
  const response = await axios.post(
    "http://localhost:3458/api/order/getOrder",
    {
      orderId: orderId,
    }
  );
  const order = response.data;
  console.log(response.data);
  console.log(email);
  console.log(customer_id);
  const resDeleteCart = await axios.delete(
    "http://localhost:3456/api/cart/clear",
    {
      params: { customerId: customer_id },
    }
  );
  console.log(resDeleteCart.data);
  await downloadInvoice(req, res, order, email);
  res.json({ order, msg: "ĐÃ HOÀN THÀNH", receiverInfo: receiverInfo });
};

const paymentWithMomo = async (req, res) => {
  //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
  //parameters
  var partnerCode = "MOMO";
  var accessKey = "F8BBA842ECF85";
  var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var requestId = partnerCode + uuid.v4();
  var orderId = requestId;
  var orderInfo = "Pay with MoMo";
  // var redirectUrl = "https://momo.vn/return";
  var redirectUrl = process.env.url_domain + "/checkout/momo_return";

  var ipnUrl = process.env.url_domain + "/checkout/ipn";
  // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
  var amount = req.body.amount;
  var requestType = "captureWallet";
  var extraData = ""; //pass empty value if your merchant does not have stores

  shippingInfo = req.body.deliveryInfo;
  products = req.body.products;
  receiverInfo = req.body.receiverInfo;
  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);
  //signature
  const crypto = require("crypto");
  var signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");
  console.log("--------------------SIGNATURE----------------");
  console.log(signature);

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });
  //Create the HTTPS objects
  const https = require("https");
  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };
  //Send the request and get the response
  const httpsReq = https.request(options, (httpsRes) => {
    console.log(`Status: ${httpsRes.statusCode}`);
    console.log(`Headers: ${JSON.stringify(httpsRes.headers)}`);
    httpsRes.setEncoding("utf8");
    httpsRes.on("data", (body) => {
      console.log("Body: ");
      console.log(body);
      console.log("payUrl: ");
      const payUrl = JSON.parse(body).payUrl;
      console.log(payUrl);
      res.json({ payUrl: payUrl });
    });
    httpsRes.on("end", () => {
      console.log("No more data in response.");
    });
  });

  httpsReq.on("error", (e) => {
    console.log(`problem with request: ${e.message}`);
  });
  // write data to request body
  console.log("Sending....");
  httpsReq.write(requestBody);
  httpsReq.end();
};

const paymentWithVNPAY = async (req, res, next) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = process.env.vnp_TmnCode;
  let secretKey = process.env.vnp_HashSecret;
  let vnpUrl = process.env.vnp_Url;
  let returnUrl = process.env.url_domain + process.env.vnp_ReturnUrl;

  let orderId = "VNPAY" + uuid.v4();
  let amount = req.body.amount;
  let bankCode = req.body.bankCode;

  shippingInfo = req.body.deliveryInfo;
  products = req.body.products;
  receiverInfo = req.body.receiverInfo;

  let locale = req.body.language;
  if (locale === null || locale === "") {
    locale = "vn";
  }
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
  res.json({ vnpUrl: vnpUrl });
};

const returnUrlVnPay = async (req, res, next) => {
  let vnp_Params = req.query;
  console.log(req.query);
  customer_id = req.query.customer_id;
  customer_name = req.query.name;
  email = req.query.email;

  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];
  delete vnp_Params["customer_id"];
  delete vnp_Params["name"];
  delete vnp_Params["email"];

  vnp_Params = sortObject(vnp_Params);

  let tmnCode = process.env.vnp_TmnCode;
  let secretKey = process.env.vnp_HashSecret;

  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  let transId = req.query.vnp_TransactionNo;

  console.log(req.query);
  console.log(signed);
  if (secureHash == signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
    // if (req.session.orderCreated) {
    //   return res.redirect("https://mostly-tender-spider.ngrok-free.app/check-order");
    // }

    const amount = req.query.vnp_Amount / 100;

    const resUpdateStock = await axios.get(
      "http://localhost:3456/api/product/updateStock",
      { params: { products: products } }
    );

    console.log("stockpdvnp: ", resUpdateStock.data);
    const resCreateOrder = await axios.post(
      "http://localhost:3458/api/order/create-order",
      {
        customer_id: customer_id,
        customer_name: customer_name,
        products: resUpdateStock.data.productsWithSerialNumbers,
        total_amount: amount,
        payment_method: "vnpay",
        receiver_info: receiverInfo,
        order_type: "web",
        order_status: "processing",
        transIdPay: transId,
      }
    );
    const order = resCreateOrder.data;
    console.log(order);
    //req.session.orderCreated = true;
    orderId = resCreateOrder.data._id;
    const resCreateOrderGHN = await axios.post(
      "http://localhost:3458/api/order/create-order-ghn",
      {
        order: resCreateOrder.data,
        codAmount: 0,
      }
    );
    console.log(resCreateOrderGHN.data);
    const resDeleteCart = await axios.delete(
      "http://localhost:3456/api/cart/clear",
      {
        params: { customerId: customer_id },
      }
    );
    console.log(resDeleteCart.data);
    await downloadInvoice(req, res, order, email);

    res.json({
      code: "00",
      msg: "ĐÃ HOÀN THÀNH",
      order: order,
      receiverInfo: receiverInfo,
    });
  } else {
    res.json({ code: "97", msg: "ĐÃ THẤT BẠI" });
  }
};

const paymentWithCod = async (req, res) => {
  console.log(req.body);
  shippingInfo = req.body.deliveryInfo;
  products = req.body.products;
  receiverInfo = req.body.receiverInfo;
  let amount = req.body.amount;
  customer_id = req.body.customer_id;
  customer_name = req.body.name;
  email = req.body.email;

  const resUpdateStock = await axios.get(
    "http://localhost:3456/api/product/updateStock",
    { params: { products: products } }
  );

  console.log("stockpdvnp: ", resUpdateStock.data);
    const resCreateOrder = await axios.post(
      "http://localhost:3458/api/order/create-order",
      {
        customer_id: customer_id,
        customer_name: customer_name,
        products: resUpdateStock.data.productsWithSerialNumbers,
        total_amount: amount,
        payment_method: "cod",
        receiver_info: receiverInfo,
        order_type: "web",
        order_status: "processing",
      }
    );
    const order = resCreateOrder.data;
    console.log(order);
    //req.session.orderCreated = true;
    orderId = resCreateOrder.data._id;
    const resCreateOrderGHN = await axios.post(
      "http://localhost:3458/api/order/create-order-ghn",
      {
        order: resCreateOrder.data,
        codAmount: resCreateOrder.data.total_amount,
      }
    );
    console.log(resCreateOrderGHN.data);
    const resDeleteCart = await axios.delete(
      "http://localhost:3456/api/cart/clear",
      {
        params: { customerId: customer_id },
      }
    );
    console.log(resDeleteCart.data);
    await downloadInvoice(req, res, order, email);
    res.json({ success: true, order: order, receiverInfo: receiverInfo });
};
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const generatePDF = async (htmlContent, orderId) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "1cm",
      right: "1cm",
      bottom: "1cm",
      left: "1cm",
    },
  });

  const filePath = path.join("./src/public/order", `invoice_${orderId}.pdf`);
  fs.writeFileSync(filePath, pdfBuffer);

  await browser.close();
  return filePath;
};

function generateNumber() {
  return Math.floor(Math.random() * 9000000) + 1000000;
}

const downloadInvoice = async (req, res, order, email) => {
  try {
    const date = new Date(order.created);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const htmlContent = `
    <table style="border: 2px solid black; border-collapse: collapse;">
            <tr style="border:2px solid black ; border-collapse: collapse;">
                <td colspan="2"> <img src="http://localhost:3454/img/logo3.ico" alt="" style="width: 200px; height: 200px;"> </td>
                <td colspan="3">
                    <h1 style="text-align: center;"> Hóa đơn giá trị gia tăng </h1>
                    <h3 style="text-align: center;"> VAT INVOICE </h3>
                    <p style="text-align: center;">Ngày(Date) ${day} tháng(month) ${month} năm(year) ${year}</p>
                    <p style="text-align: center;">Mã của CQT: 0X0FXXXX57XXFF4E9XXE99C3XX96EXX2X</p>
                </td>
                <td colspan="4">
                    <p style="text-align: center;"> Ký hiệu (Serial): AA/21E </p>
                    <p style="text-align: center;"> Số(No.):
                    <h2 style="color: red; font-weight: bold; text-align: center;">${generateNumber()}</h2>
                    </p>
                </td>
            </tr>
            <tr style="border:2px solid black ; border-collapse: collapse;">
                <td colspan="3">
                    <p >Đơn vị bán hàng (Seller): </p>
                    <p>Mã số thuế (VAT code): </p>
                    <p>Địa chỉ (Address): </p>
                    <p>Điện thoại (Tel): </p>
                    <p>Số tài khoản (A/C No.): </p>
                </td>
                <td colspan="3">
                    <p>CÔNG TY TNHH TDTU MOBILE</p>
                    <p style="font-weight: bold;">0312112772</p>
                    <p>Số 19, đường Nguyễn Hữu Thọ, phường Tân Phong, Quận 7, TP. Hồ Chí Minh</p>
                    <p>(028) 37 755 035</p>
                    <p>......................</p>
                </td>
            </tr>
            <tr style="border:2px solid black ; border-collapse: collapse;" >
                <td style="width: 100px;" colspan="3">
                    <p>Họ tên người mua hàng (Buyer): </p>
                    <p>Tên đơn vị (Company's name): </p>
                    <p>Mã số thuế (Tax code): </p>
                    <p>Hình thức thanh toán (Payment metdod): </p>
                    <p>Địa chỉ (Address): </p>
                </td>
                <td  colspan="3">
                    <h4>${order.customer_name}</h4>
                    <p>......................</p>
                    <p>......................</p>
                    <p>${order.payment_method}</p>
                    <p>${order.receiver_info}</p>
                </td>
            </tr>
            <tr style="border:2px solid black ; border-collapse: collapse;">
                <td style="border:2px solid black ; border-collapse: collapse; width: 5px;" >STT (No.)</td>
                <td style="border:2px solid black ; border-collapse: collapse;">Tên hàng hóa, dịch vụ (Description)</td>
                <td style="border:2px solid black ; border-collapse: collapse;">Đơn vị tính(Unit)</td>
                <td style="border:2px solid black ; border-collapse: collapse;">Số lượng(Quantity)</td>
                <td style="border:2px solid black ; border-collapse: collapse;">Đơn giá(Unit price)</td>
                <td style="border:2px solid black ; border-collapse: collapse;">Thành tiền(Chưa thuế GTGT)(Amount not VAT)</td>
                <td style="border:2px solid black ; border-collapse: collapse;">TS GTGT(VAT rate)</td>
                <td style="border:2px solid black ; border-collapse: collapse;">Tiền thuế (VAT)</td>
                <td style="border:2px solid black ; border-collapse: collapse;">Thành tiền(Gồm thuế GTGT)(Amount)</td>
            </tr>

            ${order.products
              .map((product, index) => {
                return `
                <tr>
                  <td style="border:2px solid black ; border-collapse: collapse;">${
                    index + 1
                  }</td>
                  <td style="border:2px solid black ; border-collapse: collapse;">${
                    product.product_name
                  }</td>
                  <td style="border:2px solid black ; border-collapse: collapse;">Cái</td>
                  <td style="border:2px solid black ; border-collapse: collapse;">${
                    product.quantity
                  }</td>
                  <td style="border:2px solid black ; border-collapse: collapse;">${formatCurrency(
                    product.unit_price * 0.92
                  )}</td>
                  <td style="border:2px solid black ; border-collapse: collapse;">${formatCurrency(
                    product.total_price * 0.92
                  )}</td>
                  <td style="border:2px solid black ; border-collapse: collapse;">8%</td>
                  <td style="border:2px solid black ; border-collapse: collapse;">${formatCurrency(
                    product.total_price * 0.08
                  )}</td>
                  <td style="border:2px solid black ; border-collapse: collapse;">${formatCurrency(
                    product.total_price
                  )}</td>
                </tr>
              `;
              })
              .join("")}
            <tr>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;">.</td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
            </tr>
            <tr>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;">.</td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
            </tr>
            <tr>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;">.</td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
            </tr>
            <tr>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;">.</td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
            </tr>
            <tr>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;">.</td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
                <td style="border:2px solid black ; border-collapse: collapse;"></td>
            </tr>
            <tr>
                
                <td style="border:2px solid black ; border-collapse: collapse;" colspan="5">Cộng tiền hàng (Total amount:)</td>
                  <td style="border:2px solid black ; border-collapse: collapse;" >${formatCurrency(
                    order.products.reduce(
                      (total, product) => total + product.total_price * 0.92,
                      0
                    )
                  )}</td>
                  <td style="border:2px solid black ; border-collapse: collapse;" ></td>
                  <td style="border:2px solid black ; border-collapse: collapse;" >${formatCurrency(
                    order.products.reduce(
                      (total, product) => total + product.total_price * 0.08,
                      0
                    )
                  )}</td>
                  <td style="border:2px solid black ; border-collapse: collapse;" >${formatCurrency(
                    order.products.reduce(
                      (total, product) => total + product.total_price,
                      0
                    )
                  )}</td>

            </tr>
            
            <tr>
                <td style="border:2px solid black ; border-collapse: collapse;" colspan="3">Số tiền viết bằng chữ (Amount in words): </td>
                <td style="border:2px solid black ; border-collapse: collapse;" colspan="6" style="padding-left:13px">${VNnum2words(
                  order.products.reduce(
                    (total, product) => total + product.total_price,
                    0
                  )
                )}</td>
            </tr>
            <tr>
                <td colspan="4" style="padding: 20px; text-align: center;">Người mua hàng (Buyer) </td>
                <td colspan="4" style="padding: 20px; text-align: center;">Người bán hàng (Seller)</td>
            </tr>
            <tr>
                <td colspan="4" style=" text-align: center;">Ký ghi rõ họ tên <br>(Sign & full name) </td>
                <td colspan="4" style=" text-align: center;">Ký, đóng dấu, ghi rõ họ tên <br>(Sign, stamp & full name) </td>
            </tr>
            <tr>
                <td colspan="4"></td>
                <td colspan="4" style="text-align: center; border: 2px solid red; color: red; padding-right: 55px; border-collapse: separate; width: 2%;">
                    <br>
                    Signature Valid 
                    <img src="http://localhost:3454/img/check.jpg" alt="Dấu tích" style="vertical-align: middle; margin-right: 5px; width: 10%;"> 
                    <br> Ký bởi: TDTU MOBILE
                    <br> Ký ngày: ${day}/${month}/${year}
                </td>
            </tr>
            <tr>
                <td>.</td>
                <td></td>
            </tr>
        </table>
      
    `;
    // Generate and download the PDF
    const filePath = await generatePDF(htmlContent, order._id);
    const mailOptions = createMailOptions(email, filePath, order);
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching order data" });
  }
};


const formatCurrency = (amount) => {
  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
  return formattedAmount;
};

module.exports = {
  paymentWithMomo,
  ipnMoMo,
  getMomoReturnPage,
  paymentWithVNPAY,
  returnUrlVnPay,
  paymentWithCod,
};
