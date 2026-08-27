const http = require("http");

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on("error", (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runTest = async () => {
  try {
    const loginData = JSON.stringify({ email: "student@ips.edu", password: "student123" });
    const loginRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(loginData)
      }
    }, loginData);

    const loginBody = JSON.parse(loginRes.body);
    const token = loginBody.token;

    // Use shrey gupta's duplicate rollNumber: "0808CI231194"
    const putData = JSON.stringify({
      name: "Saksham Jain Duplicate",
      rollNumber: "0808CI231194", 
      branch: "CS",
      graduationYear: 2026,
      semester: 6,
      bio: "Saksham duplicate bio",
      skills: ["React"]
    });
    
    const putRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/profile/sakshamjain@gmail.com",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(putData),
        "Authorization": `Bearer ${token}`
      }
    }, putData);

    console.log("POST Status Code:", putRes.statusCode);
    console.log("POST Response Body:", putRes.body);
    process.exit(0);
  } catch (err) {
    console.error("Error making HTTP request to local server:", err.message);
    process.exit(1);
  }
};

runTest();
