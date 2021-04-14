var animWait = 5500;
        const ipc = require('electron').ipcRenderer;
        document.onreadystatechange = function () {
            if (document.readyState == "interactive") {
                ipc.send("ready","domready")
                ipc.on("init", function (e,a){
                    if(a == "reload"){
                        animWait = 2000;
                        document.getElementById("preloader").style.display = "none";
                        document.getElementById("mw").style.display = "block";
                        document.getElementById("load-text").innerHTML = "AirCode is reloading"
                    } else {
                        anime({
                            targets: '#preloader path',
                            strokeDashoffset: [anime.setDashoffset, 0],
                            easing: 'easeInOutSine',
                            duration: 1500,
                            delay: function(el, i) { return i * 250 },
                            direction: 'alternate',
                            loop: 2
                        });
                        setTimeout(function(){
                            anime({
                                targets: '#preloader',
                                opacity: '0',
                                easing: 'easeInOutQuad'
                            });
                        },3200)
                    }
                })
                ipc.on("startcomplete", function () {
                    setTimeout(function(){
                        document.getElementById("content").style.display = "block";
                        document.getElementById("loading").style.display = "none";
                    },animWait)
                    ipc.on('code', function (e,args){

                        document.getElementById("codecount").innerHTML = Number(document.getElementById("codecount").innerHTML)+1;

                    })
                    ipc.on('ip', function (e,args){

                        document.getElementById("ip-text").innerHTML = args;
                        new QRCode(document.getElementById("qrcode"), "||aircode||ip:"+args);
                        setTimeout(function(){
                            anime({
                                targets: '#qrcode',
                                height: '260',
                                easing: 'easeInOutQuad'
                         });
                        },animWait+100)

                    })
                    ipc.on('connected', function (e,args){
                        
                        changeToConnectedView()

                        document.getElementById("connection-status").innerHTML = "Connected to: "+args.name+" ("+args.ip+")";
                        //document.getElementById("lastcode-div").style.display = "block";
                        //document.getElementById("connection-info").style.display = "none";
                        document.getElementById("cstat-loader").style.display = "none";

                    })
                })
            }
        }

        async function changeToConnectedView(){
            var prom_1 = anime({
                targets: '#connection-info',
                opacity: '0',
                easing: 'easeInOutQuad'
            }).finished

            await Promise.all([prom_1])
            document.getElementById("connection-info").style.display = "none";

            document.getElementById("lastcode-div").style.opacity = "0";
            document.getElementById("lastcode-div").style.display = "block";
            anime({
                targets: '#lastcode-div',
                opacity: '100',
                easing: 'easeInOutQuad'
            })

        }