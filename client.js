var PROTO_PATH = "./utils/stock.proto";

var parseArgs = require("minimist");
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH, 
    {
        keepCase    : true, 
        longs       : String, 
        enums       : String, 
        defaults    : true, 
        oneofs      : true
    });
var stock_proto = grpc.loadPackageDefinition(packageDefinition).stock;

function main(){
    var argv = parseArgs(process.argv.slice(2), {
        string : "target"
    });
    var target;
    if (argv.target) {
        target = argv.target;
    }else{
        target = "127.0.0.1:50051"
    }

    var client = new stock_proto.StockService(
        target, 
        grpc.credentials.createInsecure()
    );

    const message = {
        gateway     : "stock-service",
        datetime    : new Date().getTime(),
        data : {
            type        : "notgoods",
            device_id   : "abc123",
            page_id     : 1,
            notgood_id  : 1,
            status      : -9,
            created_by  : 1
        }
    };

    client.setup({ message : JSON.stringify(message)}, (error, response) =>{
        if(error){
            throw error;
        }
        console.log(response.code);
        console.log(response.msg);
    });

}


main();