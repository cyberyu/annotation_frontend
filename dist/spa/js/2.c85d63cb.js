(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[2],{"1e5b":function(t,e,s){},"2da0":function(t,e,s){"use strict";s("1e5b")},"54a7":function(t,e,s){"use strict";s("7f3d")},"713b":function(t,e,s){"use strict";s.r(e);var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("q-layout",{attrs:{view:"lHh Lpr lFf"}},[s("q-header",{attrs:{elevated:""}},[s("q-toolbar",[s("q-btn",{attrs:{flat:"",dense:"",round:"",icon:"home","aria-label":"Menu"},on:{click:function(e){return t.$router.push("/")}}}),s("q-toolbar-title",{staticClass:"row"},[s("router-link",{staticClass:"main-link",attrs:{to:"/"}},[t._v("MIC")]),s("div",{staticClass:"col text-center"},[t._v(t._s(t.mode))])],1),t.isLoggedIn?s("q-btn-dropdown",{attrs:{color:"primary",label:"Welcome "+t.user.username}},[s("q-list",{attrs:{separator:""}},[s("q-item",{attrs:{clickable:"",ripple:"",href:t.$hostname+"/admin/",target:"_blank",tag:"a"}},[s("q-item-section",{attrs:{avatar:""}},[s("q-icon",{attrs:{name:"admin_panel_settings"}})],1),s("q-item-section",[t._v("\n                Admin\n              ")])],1),s("q-item",{attrs:{clickable:"",ripple:""},on:{click:function(e){return t.logout()}}},[s("q-item-section",{attrs:{avatar:""}},[s("q-icon",{attrs:{name:"logout"}})],1),s("q-item-section",[t._v("Logout")])],1)],1)],1):t._e()],1)],1),t.isLoggedIn?t._e():s("login"),t.isLoggedIn?s("q-page-container",[s("router-view",{on:{mode:function(e){t.mode=e}}})],1):t._e()],1)},r=[],o=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("q-dialog",{staticClass:"column justify-center",attrs:{persistent:""},model:{value:t.notLoggedIn,callback:function(e){t.notLoggedIn=e},expression:"notLoggedIn"}},[s("q-card",{staticClass:"q-pa-sm",staticStyle:{width:"400px","max-width":"80vw"}},[s("q-toolbar",[s("q-toolbar-title",[t._v(" "+t._s("login"===t.mode?"Login":"Register")+" ")])],1),"login"===t.mode?s("q-form",{staticClass:"q-gutter-md",on:{submit:t.login}},[s("q-input",{attrs:{filled:"",label:"username",hint:"Usually your Vanguard username","lazy-rules":"",rules:[function(t){return t&&t.length>0||"Please type something"}]},model:{value:t.username,callback:function(e){t.username=e},expression:"username"}}),s("q-input",{attrs:{filled:"",label:"password",type:"password","error-message":t.errorMsg,error:t.error,"lazy-rules":"",rules:[function(t){return t&&t.length>0||"Please type something"}]},model:{value:t.password,callback:function(e){t.password=e},expression:"password"}}),s("div",{staticClass:"column items-center q-mt-xs"},[s("q-btn",{staticClass:"col",attrs:{label:"Log In",type:"submit",color:"primary"}}),s("div",{staticClass:"row q-my-sm hidden"},[t._v("\n        No account yet? "),s("span",{staticClass:"register q-pl-xs",on:{click:function(e){t.mode="register"}}},[t._v(" Register")])])],1)],1):s("q-form",{staticClass:"q-gutter-md col-12",on:{submit:t.register}},[s("q-input",{attrs:{filled:"",label:"username",hint:"Usually your Vanguard username","lazy-rules":"",rules:[function(t){return t&&t.length>0||"Please type something"}]},model:{value:t.username,callback:function(e){t.username=e},expression:"username"}}),s("q-input",{attrs:{filled:"",label:"password",type:"password","lazy-rules":"",rules:[function(t){return t&&t.length>0||"Please type something"}]},model:{value:t.password1,callback:function(e){t.password1=e},expression:"password1"}}),s("q-input",{attrs:{filled:"",label:"password confirmation",type:"password","lazy-rules":"",rules:[function(t){return t&&t.length>0||"Please type something"}]},model:{value:t.password2,callback:function(e){t.password2=e},expression:"password2"}}),s("div",{staticClass:"column items-center q-mt-xs"},[s("q-btn",{staticClass:"col",attrs:{label:"Register",type:"submit",color:"primary"}}),s("div",{staticClass:"row q-my-sm"},[t._v("\n          Already have an account? "),s("span",{staticClass:"register q-pl-xs",on:{click:function(e){t.mode="login"}}},[t._v(" Login ")])])],1)],1)],1)],1)},n=[],l={name:"Login",data(){return{username:null,password:null,password1:null,password2:null,mode:"login",notLoggedIn:!0,error:!1,errorMsg:null}},mounted(){this.$store.dispatch("auth/setCSRFToken")},methods:{login(){const t={username:this.username,password:this.password};this.$store.dispatch("auth/login",t).then((t=>{console.log("...",t.data.detail)})).catch((t=>{this.error=!0,this.errorMsg=t.response.data.detail}))},logout(){this.$store.dispatch("auth/logout")},register(){const t={username:this.username,password1:this.password1,password2:this.password2};this.$store.dispatch("auth/register",t)}},watch:{mode(){this.password=null,this.password1=null,this.password2=null,this.username=null},password(){this.error=!1},username(){this.error=!1}}},i=l,u=(s("54a7"),s("2877")),c=s("24e8"),d=s("f09f"),m=s("65c6"),p=s("6ac5"),g=s("0378"),h=s("27f9"),w=s("9c40"),f=s("eebe"),b=s.n(f),q=Object(u["a"])(i,o,n,!1,null,"79677a5c",null),v=q.exports;b()(q,"components",{QDialog:c["a"],QCard:d["a"],QToolbar:m["a"],QToolbarTitle:p["a"],QForm:g["a"],QInput:h["a"],QBtn:w["a"]});var y={name:"MainLayout",components:{Login:v},data(){return{mode:null,leftDrawerOpen:!1}},mounted(){},methods:{logout(){this.$store.dispatch("auth/logout")}},computed:{isLoggedIn(){return this.$store.getters["auth/authenticated"]},user(){return this.$store.getters["auth/user"]}}},_=y,Q=(s("2da0"),s("4d5a")),C=s("e359"),L=s("f20b"),k=s("1c1c"),x=s("66e5"),I=s("4074"),$=s("0016"),T=s("9404"),M=s("0170"),P=s("09e3"),z=Object(u["a"])(_,a,r,!1,null,null,null);e["default"]=z.exports;b()(z,"components",{QLayout:Q["a"],QHeader:C["a"],QToolbar:m["a"],QBtn:w["a"],QToolbarTitle:p["a"],QBtnDropdown:L["a"],QList:k["a"],QItem:x["a"],QItemSection:I["a"],QIcon:$["a"],QDrawer:T["a"],QItemLabel:M["a"],QPageContainer:P["a"]})},"7f3d":function(t,e,s){}}]);