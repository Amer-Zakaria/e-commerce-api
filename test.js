const url = "http://localhost:3000/api/products";
const data = {};

const options = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  //   body: JSON.stringify(data),
};

for (let i = 0; i < 10000; i++) {
  fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Handle the parsed JSON data or the non-JSON data based on the response
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
