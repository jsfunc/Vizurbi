var TEXT_CONTENT = "my own text avec accents &é&èà";
var FILENAME = "mytestfile.txt";
var blob;



function unzipBlob(blob, callback) {
	zip.createReader(new zip.BlobReader(blob), function(zipReader) {
		zipReader.getEntries(function(entries) {
			entries[0].getData(new zip.BlobWriter(zip.getMimeType(entries[0].filename)), function(data) {
				console.log("here");
				zipReader.close();
				callback(data);
			});
		});
	}, function (message) {// error handler
		console.error(message);
	});
}

url = "mytestfile.zip";

var xhr = new XMLHttpRequest();
xhr.open('GET', url , true);
xhr.responseType = 'blob';

xhr.onload = function(e) {
  if (this.status == 200) {
    // Note: .response instead of .responseText
    var blob = new Blob([this.response], {type: 'zip'});
    console.log("blob received: "+blob);
    unzipBlob(blob, displayBlob);
  }
};

function displayBlob(blob){
	console.log("text is:");
	var reader = new FileReader();
	reader.onload = function(e) {
		console.log(e.target.result);
		console.log("--------------");
	};
	reader.readAsText(blob);
}

xhr.send();




/*
function logBlobText(blob) {
	var reader = new FileReader();
	reader.onload = function(e) {
		console.log(e.target.result);
		console.log("--------------");
	};
	reader.readAsText(blob);
}

zip.workerScriptsPath = "./";
blob = new Blob([ TEXT_CONTENT ], {
	type : zip.getMimeType("mytestfile.txt")
});
logBlobText(blob);
zipBlob(blob, function(zippedBlob) {
	unzipBlob(zippedBlob, function(unzippedBlob) {
		logBlobText(unzippedBlob);
	});
});
*/