L.SpinMapMixin={spin:function(b,a){if(!!b){if(!this._spinner){this._spinner=new Spinner(a).spin(this._container);this._spinning=0}this._spinning++}else{this._spinning--;if(this._spinning<=0){if(this._spinner){this._spinner.stop();this._spinner=null}}}}};L.Map.include(L.SpinMapMixin);L.Map.addInitHook(function(){this.on("layeradd",function(a){if(a.layer.loading){this.spin(true)}if(typeof a.layer.on!="function"){return}a.layer.on("data:loading",function(){this.spin(true)},this);a.layer.on("data:loaded",function(){this.spin(false)},this)},this);this.on("layerremove",function(a){if(a.layer.loading){this.spin(false)}if(typeof a.layer.on!="function"){return}a.layer.off("data:loaded");a.layer.off("data:loading")},this)});