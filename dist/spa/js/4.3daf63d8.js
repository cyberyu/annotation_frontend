(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[4],{"8b24":function(t,e,s){"use strict";s.r(e);var n=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("q-page",{staticClass:"flex flex-center"},[s("div",{staticClass:"row col-12"},[s("div",{staticClass:"row justify-center col-12"},[s("q-btn",{staticClass:"justify-center",attrs:{color:"primary",label:"Get Data"},on:{click:function(e){return t.fetchDocs()}}})],1),t._l(t.documents,(function(e,n){return s("div",{key:n,staticClass:"col-12 q-px-md q-py-md"},[t._v("\n      "+t._s(e.text)+"\n    ")])}))],2)])},a=[],c={name:"PageIndex",data(){return{documents:[]}},mounted(){},methods:{fetchDocs(){this.$axios.get(this.$hostname+"/documents/").then((t=>{console.log("use host",this.$hostname),this.documents=t.data.results}))}}},o=c,l=s("2877"),i=s("9989"),r=s("9c40"),u=s("eebe"),d=s.n(u),m=Object(l["a"])(o,n,a,!1,null,null,null);e["default"]=m.exports;d()(m,"components",{QPage:i["a"],QBtn:r["a"]})}}]);