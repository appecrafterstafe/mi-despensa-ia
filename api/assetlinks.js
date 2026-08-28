export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "app.vercel.mi_despensa_ia.twa",
        sha256_cert_fingerprints: ["99:84:1F:FF:10:BF:51:F5:8D:5C:BA:8F:E8:56:06:5D:E9:31:95:2C:96:A6:71:54:D1:D0:71:73:0B..."]
      }
    }
  ]);
}
