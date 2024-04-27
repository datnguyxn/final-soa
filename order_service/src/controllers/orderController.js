const Order = require("../models/order");
const mongoose = require("mongoose");
const moment = require("moment");
const axios = require("axios");
const VNnum2words = require("vn-num2words");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const getOrderOfUser = async (req, res) => {
  const customerId =
    req.body.customerId || req.query.customerId || req.params.customerId;
  console.log(customerId);
  const order = await Order.find({
    customer_id: customerId,
  }).sort({
    created: -1,
  });
  res.status(200).json(order);
};

const getOrderByOrderId = async (req, res) => {
  const orderId = req.body.orderId || req.query.orderId || req.params.orderId;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.send({ message: "Invalid order ID" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.send({ message: "Order not found" });
    }
    res.send(order);
  } catch (error) {
    console.log(error);
  }
};

const createOrder = async (req, res) => {
  const {
    customer_id,
    customer_name,
    products,
    total_amount,
    payment_method,
    receiver_info,
    order_type,
    order_status,
    transIdPay,
  } = req.body;
  const newOrder = new Order({
    customer_id,
    customer_name,
    products,
    total_amount,
    payment_method,
    receiver_info,
    order_type,
    order_status,
    transIdPay,
  });
  try {
    const order = await newOrder.save();
    res.status(201).json(order);
  } catch (error) {
    res.json({ message: error.message });
  }
};

const createOrderGHN = async (req, res) => {
  const { order, codAmount } = req.body || req.query || req.params;
  try {
    const url =
      "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create";
    const headers = {
      "Content-Type": "application/json",
      Token: "7b6f17c8-eea8-11ee-8bfa-8a2dda8ec551",
      ShopId: 191637,
    };
    const urlProvince =
      "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province";
    const responseProvince = await axios.get(urlProvince, { headers });
    const province = responseProvince.data.data.find((item) =>
      order.receiver_info.split(", ")[5].includes(item.ProvinceName)
    );
    const urlDistrict =
      "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district";
    const dataDistrict = { province_id: province.ProvinceID };
    const responseDistrict = await axios.post(urlDistrict, dataDistrict, {
      headers,
    });
    const district = responseDistrict.data.data.find((item) =>
      order.receiver_info.split(", ")[4].includes(item.DistrictName)
    );
    const urlWard =
      "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id";
    const dataWard = { district_id: district.DistrictID };
    const responseWard = await axios.post(urlWard, dataWard, { headers });
    var ward = order.receiver_info.split(", ")[3].trim();
    console.log(ward);
    if (ward.startsWith("Phường")) {
      var number = ward.replace(/\D/g, "").slice(-3);
      number = parseInt(number, 10);
      console.log(number);
      ward = number
        ? "Phường " + number
        : "Phường " + ward.replace("Phường ", "").trim();
    }
    const foundWard = responseWard.data.data.find((item) =>
      item.WardName.includes(ward)
    );

    const infoArr = order.receiver_info.split(", ").map((item) => item.trim());
    const data = {
      payment_type_id: 1,
      note: "Gọi trước khi giao hàng",
      required_note: "KHONGCHOXEMHANG",
      from_name: "TDTU MOBILE",
      from_phone: "(028) 37 755 035",
      from_address: "Số 19, đường Nguyễn Hữu Thọ,",
      from_ward_name: "Phường Tân Phong",
      from_district_name: "Quận 7",
      from_province_name: "HCM",
      client_order_code: "",
      to_name: `${infoArr[0]}`,
      to_phone: `${infoArr[1]}`,
      to_address: `${infoArr[2]}`,
      to_ward_name: `${infoArr[3]}`,
      "to_district_name ": `${infoArr[4]}`,
      to_province_name: `${infoArr[5]}`,
      to_ward_code: `${foundWard.WardCode}`,
      to_district_id: `${district.DistrictID}`,
      cod_amount: codAmount,
      weight: 200,
      length: 1,
      width: 19,
      height: 10,
      content: "Sản phẩm điện tử",
      deliver_station_id: null,
      insurance_value: order.total_amount,
      service_id: 0,
      service_type_id: 2,
      coupon: null,
      pick_shift: [2],
      items: order.products.map((product) => ({
        name: product.product_name,
        code: product._id,
        quantity: product.quantity,
        price: product.unit_price,
        length: 15,
        width: 7,
        height: 2,
        weight: 2000,
      })),
    };
    const response = await axios.post(url, data, { headers });
    console.log(response.data.message_display);
    await Order.findByIdAndUpdate(
      order._id,
      { order_code_GHN: response.data.data.order_code },
      { new: true }
    );
    res.json({ message: "success" });
  } catch (error) {
    console.error(error);
  }
};

const cancelOrder = async (req, res) => {
  const orderId = req.body.orderId;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.send({ message: "Invalid order ID" });
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.send({ message: "Order not found" });
    }

    if (order.order_status !== "processing") {
      return res.send({
        message: "Only orders in the Preprocessing status can be cancelled",
      });
    }
    if (order.payment_method === "momo") {
      const rfMomo = axios.post(
        "http://localhost:3459/api/refund/refund-momo",
        {
          transId: order.transIdPay,
          amount: order.total_amount / 100,
        }
      );
      console.log(rfMomo.data);
    } else if (order.payment_method === "vnpay") {
      res.json({ message: "success" });
    }
    order.order_status = "canceled";
    await order.save();
    const headers = {
      "Content-Type": "application/json",
      Token: "7b6f17c8-eea8-11ee-8bfa-8a2dda8ec551",
      ShopId: 191637,
    };
    const data = {
      order_codes: [order.order_code_GHN],
    };
    const response = await axios.post(
      "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel",
      data,
      { headers }
    );
    console.log(response.data);
    res.send({ message: "Order cancelled successfully" });
  } catch (error) {
    console.log(error);
  }
};

const getAllOrder = async (req, res) => {
  let { page, pageSize, search, orderType } = req.query;
  // Set default values if not provided
  page = page ? parseInt(page, 10) : 1;
  pageSize = pageSize ? parseInt(pageSize, 10) : 6;

  // Create a MongoDB query object based on search criteria
  const query = {};
  if (search) {
    try {
      query._id = new ObjectId(search);
    } catch (error) {
      req.session.orderMessage = {
        type: "danger",
        message: "Hãy nhập đầy đủ mã hóa đơn",
      };
    }
  }
  // Add condition to filter by order type
  if (orderType) {
    query.order_type = orderType;
  }

  // Fetch orders with pagination and search
  const orders = await Order.find(query)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .exec();
  const totalOrders = await Order.countDocuments(query);

  const totalPages = Math.ceil(totalOrders / pageSize);

  const pagination = {
    pages: Array.from({ length: totalPages }, (_, i) => ({
      page: i + 1,
      isCurrent: i + 1 === page,
    })),
    pageSize,
    currentPage: page,
    totalOrders,
  };
  if (page > 1) {
    pagination.prevPage = page - 1;
  }

  if (page < totalPages) {
    pagination.nextPage = page + 1;
  }
  const plainOrder = orders.map((order) => ({
    ...order.toJSON(),
    created: moment(order.created).format("DD/MM/YYYY HH:mm:ss"),
    total_amount: formatCurrency(order.total_amount),
  }));
  res.json({ orders: plainOrder, pagination, totalPages, orderType, search });
};

const changeOrderStatus = async (req, res) => {
  try {
    const orderId = req.body.id;
    const newStatus = req.body.status;
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ error: "Order not found." });
      return;
    }
    const headers = {
      "Content-Type": "application/json",
      Token: "7b6f17c8-eea8-11ee-8bfa-8a2dda8ec551",
      ShopId: 191637,
    };
    const data = {
      order_codes: [order.order_code_GHN],
    };
    let url = "";
    switch (newStatus) {
      case "delivery_again":
        order.order_status = "storing";
        url =
          "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/storing";
        break;
      case "return_order":
        order.order_status = "return";
        url =
          "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/return";
        break;
      default:
        res.status(400).json({ error: "Invalid status." });
        return;
    }
    const response = await axios.post(url, data, { headers }).catch((error) => {
      console.error("Error in axios request:", error);
      res
        .status(500)
        .json({ error: "An error occurred while making the request." });
    });
    console.log(response.data);
    await order.save();
    res.json({
      success: true,
      message: `Order status changed to ${newStatus} successfully.`,
    });
  } catch (error) {
    console.error("Error changing order status:", error);
    res
      .status(500)
      .json({ error: "An error occurred while changing order status." });
  }
};

const updateOrderStatusWithGHN = async (req, res) => {
  try {
    const orderType = req.query.orderType;
    const orderId = req.body.id;
    const order = await Order.findById(orderId);
    if (orderType === "web") {
      const responseCustomer = await axios.get(
        "http://localhost:3457/api/customer-info/get-customer-by-id",
        { params: { customer_id: order.customer_id } }
      );

      const customerEmail = responseCustomer.data.email;
      const headers = {
        "Content-Type": "application/json",
        Token: "7b6f17c8-eea8-11ee-8bfa-8a2dda8ec551",
        ShopId: 191637,
      };
      const response = await axios.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail",
        { order_code: order.order_code_GHN },
        { headers }
      );
      const logs = response.data.data.log;
      if (logs && logs.length > 0) {
        const lastLog = logs[logs.length - 1];
        const lastStatus = lastLog.status;
        if (
          lastStatus == "delivered" &&
          !order.emailSent &&
          order.order_type === "web"
        ) {
          order.order_status = "completed";
          order.emailSent = true;
          const mailOptions = {
            from: "nguyenquangloi2666@gmail.com",
            to: customerEmail,
            subject: "Thông tin bảo hành sản phẩm",
            html: `
            <p>Xin chào,</p>
            <p>Chúc mừng bạn đã hoàn thành đơn hàng với mã ${orderId}.</p>
            <p>Dưới đây là thông tin bảo hành chung cho tất cả các sản phẩm trong đơn hàng:</p>
            <ul>
              <li><strong>Thời gian bảo hành:</strong> Sản phẩm của chúng tôi được bảo hành trong vòng 12 tháng kể từ ngày mua.</li>
              <li><strong>Điều kiện bảo hành:</strong> Bảo hành không áp dụng cho các hư hỏng do rơi, vỡ, va đập, hoặc tự ý tháo lắp, sửa chữa.</li>
            </ul>
            <p>Cảm ơn bạn đã mua hàng!</p>
            <p>Trân trọng,</p>
            <p>Chú ý: Đây là email tự động, vui lòng không trả lời.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #868e96; text-align: center;">TDTU MOBILE</p>
          `,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email:", error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
          await order.save();
          res.json({
            success: true,
            message: "Order status updated successfully.",
          });
        } else if (lastStatus == "delivering") {
          order.order_status = "shipped";
          await order.save();
          res.json({
            success: true,
            message: "Order status updated successfully.",
          });
        } else if (lastStatus == "waiting_to_return") {
          order.order_status = "waiting_to_return";
          await order.save();
          res.json({
            success: true,
            message: "Order status updated successfully.",
          });
        } else if (lastStatus == "return") {
          order.order_status = "return";
          await order.save();
          res.json({
            success: true,
            message: "Order status updated successfully.",
          });
        } else if (lastStatus == "returning") {
          order.order_status = "returning";
          await order.save();
          res.json({
            success: true,
            message: "Order status updated successfully.",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error updating order status with GHN:", error);
    res
      .status(500)
      .json({
        error: "An error occurred while updating order status with GHN.",
      });
  }
};

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
const downloadInvoiceInWeb = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
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
    res.download(filePath);
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

const generatePDFPos = async (htmlContent, res, orderId) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A5", printBackground: true });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="invoice_${orderId}.pdf"`
  );
  res.status(200).send(pdfBuffer);

  await browser.close();
};

const downloadInvoiceInPos = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).exec();
    const formattedDate = moment(order.created).format("DD/MM/YYYY HH:mm:ss");
    const formattedTotalAmount = formatCurrency(order.total_amount);
    // Create HTML content for the PDF
    const htmlContent = `
        <div class="modal fade" id="exampleModal" class="modal" tabindex="-1" role="dialog"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="invoicemodal">
                <div class="modal-body">
                    <div id="finalinvoice">
                        <div id="print_invoice" <div="" class="col-12 partition">
                            <center>
                                <h5 class="font-weight-bolder w-50"><img style="width:13%; height:7%"src="http://localhost:3454/img/logo3.ico" alt="" /></h5>
                                <h5>Số 19, đường Nguyễn Hữu Thọ, phường Tân Phong, Quận 7, TP. Hồ Chí Minh</h5>
                                <p><span class="font-weight-bold font-14">Điện thoại: </span>(028) 37 755 035</p>
                                <p><span class="font-weight-bold font-14">Email:
                                    </span>tonducthanguniversity@tdtu.edu.vn</p>
                            </center>
                        </div>
                        <hr>
                        <div class="row d-flex justify-content-around">
                            <div class="col-6">
                                <p id="orderNumber"><span class="font-weight-bold">Order Id: ${
                                  order._id
                                }</span></p>
                            </div>
                            <div class="col-6">
                                <p id="orderDate">Ngày và giờ: ${formattedDate}</p>
                            </div>
                        </div>
                        <div class="row d-flex justify-content-around">
                            <div class="col-6">
                                <p id="orderNameCus"><span class="font-weight-bold">Tên khách hàng: ${
                                  order.customer_name
                                }</span></p>
                            </div>
                            <div class="col-6">
                                <p id="orderPaymentMethod"><span>Phương thức thanh toán: ${
                                  order.payment_method
                                }</span></p>
                            </div>
                        </div>
                        <div class="row d-flex justify-content-around">
                            <div class="col-6">
                                <p id="orderNameStaff"><span class="font-weight-bold">Nhân viên: ${
                                  order.staff_name
                                }</span></p>
                            </div>
                            <div class="col-6">
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table id="default-datatable" class="display table  ">
                                <thead>
                                    <tr>
                                        <th>Sr No</th>
                                        <th> Tên</th>
                                        <th> Số lượng</th>
                                        <th> Giá</th>
                                        <th> Tổng giá</th>
                                    </tr>
                                </thead>
                                <tbody id="item" class="align-items-center">
                                ${order.products
                                  .map(
                                    (product, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${product.product_name}</td>
                                        <td>${product.quantity}</td>
                                        <td>${formatCurrency(
                                          product.unit_price
                                        )}</td>
                                        <td>${formatCurrency(
                                          product.total_price
                                        )}</td>
                                    </tr>
                                `
                                  )
                                  .join("            ")}
                                </tbody>
                            </table>
                        </div>
                        <hr>
                        <div class="row justify-content-end" style="marin:-15px">
                            <table class="col-6 table table-borderless text-right">
                                <tbody>
                                <tr>
                                <td>Tổng giá thực:</td>
                                <td class="text-left"><span id="oldTotalAmountInvoice">${formatCurrency(
                                  order.total_amount /
                                    (1 - order.discount / 100)
                                )}</span></td>
                                </tr>
                                    <tr>
                                        <td>Khuyến mãi:</td>
                                        <td class="text-left"><span id="discount"> ${
                                          order.discount
                                        }%</span></td>
                                    </tr>
                                    <tr>
                                        <td class="font-weight-bold font-18">Tổng giá hóa đơn :</td>
                                        <td class="text-left" id="totalAmountInvoice">${formattedTotalAmount}</td>
                                    </tr>
                                    <tr>
                                            <td>Tiền nhận:</td>
                                            <td class="text-left"><span id="amount_given">${formatCurrency(
                                              order.amount_given
                                            )}</span></td>
                                        </tr>
                                        <tr>
                                            <td>Tiền thối:</td>
                                            <td class="text-left"><span id="change_given">${formatCurrency(
                                              order.change_given
                                            )}</span></td>
                                        </tr>
                                </tbody>
                            </table>
                        </div>
                        <hr>
                        <div class="row">
                            <p class="m-l-15">Mobile&Accessories</p>
                        </div>
                        <center>
                            <h3 class="font-18">******** Xin cám ơn quý khách ********</h3>
                        </center>
                        <hr>
                    </div>
                </div>
            </div>
        </div>
    </div>
        `;
    // Generate and download the PDF
    await generatePDFPos(htmlContent, res, orderId);
  } catch (err) {
    res.status(500).json({ error: "Error fetching order data" });
  }
};
module.exports = {
  getOrderOfUser,
  getOrderByOrderId,
  createOrder,
  createOrderGHN,
  cancelOrder,
  getAllOrder,
  changeOrderStatus,
  updateOrderStatusWithGHN,
  downloadInvoiceInWeb,
  downloadInvoiceInPos,
};
