var http = require('http');
var fs   = require('fs');
var url  = require('url');

var applicationConfig = {
		path: '/tmp/nodechat.txt'
};

http.createServer(function (req, res) {
  
	var url_parts = url.parse(req.url);
	console.log('Server running at http://127.0.0.1:1337/');
	console.log(req.url);
	
	//checks if file exists. If it doesnt, create it
	if (!fs.existsSync(applicationConfig.path))
		fs.openSync(applicationConfig.path, 'w');

	 switch(url_parts.pathname) {
	    case '/':
	    	display_chat(url_parts.pathname, req, res);
		break;
	    case '/send':
	    	process_send(url_parts.pathname, req, res);
	    break;
	}
    return;
  
}).listen(1337, '127.0.0.1');

/**
 * Displays chat
 * 
 * @param path
 * @param req
 * @param res
 */
function display_chat(path, req, res)
{
	res.writeHead(200, {'Content-Type': 'text/html'});
	chatManager.displayChat(res);
	chatManager.displayForm(res);
	res.end('\n');
}

/**
 * Posts a contribution in the chat
 * 
 * @param path
 * @param req
 * @param res
 */
function process_send(path, req, res)
{
	var body = "";
	  req.on('data', function (chunk) {
	    body += chunk;
	  });
	 
	  req.on('end', function () {
		 
		    if (body != '')
		    {
		        var values = body.split("=");
		        var postedValues = [];
		        var index;
		        for (var i in values)
		        {
		        	if (i % 2 == 0) {
		        		index = values[i];
		        		postedValues[index] = null;
		        	}
		        	else {
		        		postedValues[index] = values[i];
		        		index = null;
		        	}
		        }
		        	
		        var line = postedValues["line"]; 
		        res.writeHead(200, {'Content-Type': 'text/html'});
		        chatManager.addLine(line);
		    	chatManager.displayChat(res);
		    	chatManager.displayForm(res);
		        res.end();
		        return;
		    }

		    res.writeHead(200);
		    chatManager.displayChat(res);
	    	chatManager.displayForm(res);
		    res.end();
		    return;
		  });
}

var chatManager = {

		/**
		 * Adds chat content in the response
		 * 
		 * @param res
		 */
		displayChat : function (res)
		{
			  var content = fs.readFileSync(applicationConfig.path, 'utf-8');
			  
			  var values = content.trim().split("\n");
			  for (i in values)
			  {
				  res.write("<div>" + values[i] + '</div>');
			  }
		},
		
		/**
		 * Adds form to the response
		 * 
		 * @param res
		 */
		displayForm : function (res)
		{
			res.write('<hr/>');
			res.write('<form action="/send" method="post">');
			res.write('<input type="text" name="line">');
			res.write('<input type="submit">');
			res.write('</form>');
		},
		
		/**
		 * Adds a line to the chat
		 * 
		 * @param content
		 */
		addLine: function (content) {
			fs.appendFileSync(applicationConfig.path, content + "\n");
		}
};