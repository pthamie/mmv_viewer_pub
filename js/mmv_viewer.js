
function analyze_h264_packet(payload, payload_length)
{

    console.log ("---- H264 : ");
}

function analyze_rtp_packet (data, data_len)
{
    const nb_src = data[0] & 0X0F;
    const PT = data[1] & 0x7F;
    const seq_num = data[2]*256 + data[3];
    const ts1 = data[4] << 24;
    const ts2 = data[5] << 16;
    const ts3 = data[6] << 8;
    const ts4 = data[7];
    const ts =  (ts1 + ts2 + ts3 + ts4) >>> 0;
    const payload_offset = 12 + nb_src * 4;
    const payload = data.slice (payload_offset);
    const payload_length = data_len - payload_offset;


    console.log ("-- RTP : " + "nb src : " + nb_src + ", PT : " + PT + ", seq num : " + seq_num + ", ts : " + ts + ", payload offset : " + payload_offset);

    analyze_h264_packet (payload, payload_length);
}

window.onload = function () {

    let fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', function (e) {
        var file = fileInput.files[0];
        var reader = new FileReader();

        reader.onload = function (e) {
            let arrayBuffer = reader.result;
            console.log(arrayBuffer.byteLength);

            let offset = 0;
            let idx_pkt = 0;

            while (offset < arrayBuffer.byteLength) {
                const atype = new Uint8Array(arrayBuffer.slice(offset, offset + 1));
                const aipv4 = new Uint8Array(arrayBuffer.slice(offset + 1, offset + 1 + 4));
                const aport = new Uint16Array(arrayBuffer.slice(offset + 5, offset + 5 + 2));
                const atime = new Uint32Array(arrayBuffer.slice(offset + 7, offset + 7 + 4));
                const adata_length = new Uint32Array(arrayBuffer.slice(offset + 11, offset + 11 + 4));

                const type = atype[0];
                const sipv4 = ""+aipv4[0]+"."+aipv4[1]+"."+aipv4[2]+"."+aipv4[3];
                const port = aport[0];
                const time = atime[0]; // todo
                const data_length = adata_length[0];

                const data = new Uint8Array(arrayBuffer.slice(offset + 15, offset + 15 + data_length));

                console.log ("idx_pkt : " + idx_pkt + ", type : " + type + ", ip : "+ sipv4 + ", port : " + port +", time : " + time +", length : " + data_length);

                analyze_rtp_packet (data, data_length);

                offset = offset + 15 + data_length;
                idx_pkt++;
            }


        }

        reader.readAsArrayBuffer(file);
    });

}
