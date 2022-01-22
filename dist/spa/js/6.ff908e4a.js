(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[6],{"79df":function(t,e,s){"use strict";s.d(e,"a",(function(){return n}));s("ddb0"),s("4e82");const n={name:"CommAnnoMixin",props:["project","review","consensus"],data(){return{mode:null,documents:[],document:null,tokens:null,sentences:null,relevantSentences:[],start:null,end:null,labels:{},labelNames:new Set,doneFetchLabels:!1,annotations:[],detailedAnnotations:[],selected:[],highlighted:[],mousePressed:!1,nextURL:null,prevURL:null,tab:"models",loading:!1,saving:!1,currentModel:null,modelQueue:[],processedQ:[],offsetTop:null,isAnnotated:null,numAnnotated:0,annotations4Review:null,showTab:"annotations",activeAuthors:[],feedback:"",modelResultCache:null,activeLabel:null,annotationOrders:null,cmodels:{},rules:[],dicts:[],vmodels:[],consensusScore:null,go2page:"",showUnRelated:!0}},mounted(){this.project.rules.filter((t=>t.kind===this.mode)).forEach((t=>{this.rules.push(t)})),this.project.dicts.filter((t=>t.kind===this.mode)).forEach((t=>{this.dicts.push(t)})),this.project.vmodels.filter((t=>t.kind===this.mode)).forEach((t=>{this.vmodels.push(t)})),this.project.cmodels.filter((t=>t.kind===this.mode)).forEach((t=>{this.cmodels[t.id]=t,this.cmodels[t.id].consensusScore={f1:null,total:null}}));const t={id:null,description:"a dummy label for labels which were created in the project",color:"#e0e0e0",name:"NULL"};this.labels.null=t;const e={id:"misc",description:"misc",color:"#e0e0e0",name:"MISC"};this.labels.misc=e,this.review||this.consensus?this.fetchDocs({}):this.fetchDocs({page:this.project.first_unannotated}),setTimeout((()=>{this.$forceUpdate()}))},methods:{alertServerErr(){this.$q.notify({message:"Oops, something went wrong on the server",color:"negative",position:"center",actions:[{label:"Dismiss",color:"white",handler:()=>{}}]})},initialLabels(t){},rejectOrAccept(t,e){t.status=t.status===e?0:e;const s=`/api/annotations/${t.id}/`,n={status:t.status};this.$axios.patch(s,n).then((t=>{console.log(t.data)})),this.annotations=this.mergeAnnotations(this.activeAuthors),this.getDetailedAnnotations(),this.$forceUpdate()},getAnnotations(t){const e=this.activeAuthors.indexOf(t);e>=0?this.activeAuthors.splice(e,1):this.activeAuthors.push(t),this.annotations=this.mergeAnnotations(this.activeAuthors),"ner"===this.mode?this.getDetailedAnnotations():"sentence"===this.mode&&this.prepareCatAnnotations()},mergeAnnotations(t){t&&0!==t.length||(t=Object.keys(this.annotations4Review));const e=t.length;let s=[];for(let n=0;n<e;n++){const e=this.annotations4Review[t[n]];-1!==e.status&&(s=s.concat(e.annotations.map((t=>(t.author=e.author,t)))))}return s.forEach((t=>t.authors=[])),s=s.filter(((t,e,n)=>e===n.findIndex((n=>String(n.pos)===String(t.pos)&&n.name===t.name&&(("ner"===this.mode||"sentence"===this.mode&&n.category===t.category)&&n.authors.push(s[e].author),!0))))),s},getColor(t){return this.labels[t.id].color},getPosOfLabel(t,e,s){const n=this.annotationOrders[t][this.getKey(s)],a=1+4*n,o=`\n      margin-top: ${a}px;\n      position: absolute;\n      width:calc(100% - ${"B"===s[0]?4+2*n:0}px);\n      border-bottom: solid ${this.getColor(s[1])} 2px;\n      margin-left: ${"B"===s[0]?4+2*n:0}px\n      `;return{order:n,pos:a,name:s.name,cls:o}},prevTight(t){let e=0;return 0===t||!this.detailedAnnotations[t-1]||this.detailedAnnotations[t-1].length<1?e:(this.detailedAnnotations[t-1].forEach((t=>{const s=this.tokens[t[1].tpos[0]][0];"B"===t[0]&&s.length<t[1].name.length&&(e+=1)})),0===e?0:e-Math.floor(this.detailedAnnotations[t].length/4))},add2Q(t){const e=this.tab+t;this.modelQueue.push(e)},removeFromQ(t){const e=this.tab+t,s=this.modelQueue.indexOf(e);this.modelQueue.splice(s,1),this.processedQ.push(e)},existInAnnotations(t){return this.annotations.some((e=>e.pos[0]===t.pos[0]&&e.pos[1]===t.pos[1]&&e.name===t.name))},findAnnotation(t,e){let s;return this.detailedAnnotations[t].forEach((t=>{t[1].id===e&&(s=t[1])})),s},executeModel(t){this.add2Q(t);const e={mtype:this.tab,id:t,document:this.document.id},s=this.consensus?"/api/calculate_consensus/":"/api/calculate/";this.$axios.post(this.$hostname+s,e).then((e=>{const s=e.data.result;this.alignTokens(s),s.forEach((t=>{t.m="m",t.id=this.lLabels[t.name]?this.lLabels[t.name].id:null;const e=t;this.existInAnnotations(e)||this.annotations.push(e)})),this.getDetailedAnnotations(),this.removeFromQ(t),this.modelResultCache?this.modelResultCache=this.modelResultCache.concat(s):this.modelResultCache=s,this.modelResultCache.sort(((t,e)=>e.confidence-t.confidence));const n=`Finished running model, and got ${s.length} results`;this.$q.notify({message:n,color:"secondary",position:"center",timeout:0,actions:[{label:"Dismiss",color:"white",handler:()=>{}},{label:"Review",color:"white",handler:()=>{this.showTab="sort"}}]}),this.consensus&&(this.cmodels[t].consensusScore={f1:100*e.data.f1,total:100*e.data.total})})).catch((e=>{console.log(e.response.data.error),this.alertServerErr(),this.removeFromQ(t)}))},scrollTo(t){let e=t.tpos;e[0]>e[1]&&(e=[e[0],e[0]]);const s=`t-${e[0]}`;this.highlighted=Array(e[1]-e[0]+1).fill(e[0]).map(((t,e)=>t+e)),console.log(t,this.highlighted),document.getElementById(s).scrollIntoView({block:"center"})},selectStart(t){this.start=t,this.selected=[t]},selectEnd(t){this.end=t,this.end<this.start&&(this.end=this.start,this.start=t)},select(t){const e=Math.min(t,this.start),s=Math.max(t,this.start);this.selected=[...Array(s-e+1).keys()].map((t=>t+e))},getTokenClass(t){let e="";return e=this.detailedAnnotations[t]?this.detailedAnnotations[t][0][0]:"",e+=this.selectedClasses[t],e+=" q-pl-sm",e+=this.highlighted.includes(t)?" highlight":"",this.showUnRelated||this.tokensInRS.includes(t)||(e+=" unrel"),"relation"===this.mode&&(this.relation.head.tpos&&this.relation.head.tpos[0]<=t&&this.relation.head.tpos[1]>=t&&(e+=" bg-yellow"),this.relation.tail.tpos&&this.relation.tail.tpos[0]<=t&&this.relation.tail.tpos[1]>=t&&(e+=" bg-yellow"),this.relation.hint.tpos&&this.relation.hint.tpos[0]<=t&&this.relation.hint.tpos[1]>=t&&(e+=" bg-yellow")),e},isPunct(t){const e=".,!\"'",s=this.tokens[t][0][0];return e.includes(s)},getWidth(t,e){let s=0;const n=this.detailedAnnotations[t][e][1].tpos;for(let a=n[0];a<n[1]+1;a++){const t=document.getElementById("t-"+a);t&&(s+=t.offsetWidth)}return s},annotate(t){const e=this.tokens[this.start][2],s=this.tokens[this.end][2]+(this.tokens[this.end][0].length-1),n={id:t.id,name:t.name,pos:[e,s],tpos:[this.start,this.end],text:this.document.text.substring(e,s+1)};for(let a=0;a<this.annotations.length;a++){const e=this.annotations[a];if(e.pos[0]===n.pos[0]&&e.pos[1]===n.pos[1]){if(e.id===t.id)return alert("already there"),0;this.annotations.splice(a,1)}}this.annotations.push(n),this.getDetailedAnnotations()},removeFromModelCache(t,e){const s=this.modelResultCache.indexOf(e);this.modelResultCache.splice(s,1)},removeAnnotation(t,e){const s=this.annotations.indexOf(e);this.annotations.splice(s,1),this.getDetailedAnnotations()},key(t){console.log("key pressed: ",t.key)},compressAnnotations(){},saveAnnotations(){if(Object.keys(this.conflicts).length>0){const t="You must resolve all conflicts before saving.";return this.$q.notify({message:t,color:"secondary",position:"center",actions:[{label:"Dismiss",color:"white",handler:()=>{}}]}),-1}this.saving=!0;const t={document:this.document.id,annotations:"ner"===this.mode||"sentence"===this.mode?this.annotations:this.relations,kind:this.mode};let e,s;"ner"!==this.mode&&"sentence"!==this.mode||!this.document.annotations.id?"relation"===this.mode&&this.document.relations.id?(s="patch",e=this.$hostname+"/api/annotations/"+this.document.relations.id+"/"):(s="post",e=this.$hostname+"/api/annotations/"):(s="patch",e=this.$hostname+"/api/annotations/"+this.document.annotations.id+"/"),0===this.annotations.length&&console.log(0),this.$axios({method:s,url:e,data:t}).then((e=>{this.saving=!1,!this.isAnnotated&&t.annotations.length>=1?(this.incrProgress(1),this.isAnnotated=!0):this.isAnnotated&&0===t.annotations.length&&(this.incrProgress(-1),this.isAnnotated=!1),this.document.annotations=e.data}))},incrProgress(t){this.numAnnotated+=t},fetchDocs(t){let e;if(this.tokens=[],this.$q.loading.show({message:"Fetching documet from server and set it up for curation. This may take a few seconds."}),t.url){const s=t.url.split("/").length;e="/"+t.url.split("/").splice(s-3,s).join("/")}else e=`/api/documents/?project=${this.project.id}&review=${this.review}&consensus=${this.consensus}&mode=${this.mode}`,t.page&&(e+=`&page=${t.page}`);this.$axios.get(e).then((t=>{this.documents=t.data.results,this.nextURL=t.data.next,this.prevURL=t.data.previous,this.document=this.documents[0];const e=this.document.annotations.id?this.document.annotations.annotations:[];this.document.related?this.relevantSentences=this.document.related.annotations:this.relevantSentences=[],this.annotations=e.filter((t=>this.labelNames.has(t.name))),this.review&&(this.annotations4Review=this.document.reviews,this.annotations=this.mergeAnnotations()),"relation"===this.mode&&(this.relations=this.document.relations.id?this.document.relations.annotations:[]),this.consensus&&(this.document.gold.annotations.forEach((t=>{t.id=this.lLabels[t.name]?this.lLabels[t.name].id:null})),this.annotations=this.document.gold.annotations),this.isAnnotated=this.document.annotations.id,this.tokens=this.document.tokens,this.sentences=this.document.sentences,("ner"===this.mode||"relation"===this.mode&&!this.review)&&this.getDetailedAnnotations(),this.highlighted=[],this.processedQ=[],this.modelQueue=[],this.consensus&&this.project.cmodels.forEach((t=>{this.cmodels[t.id].consensusScore.f1=null})),this.$q.loading.hide(),this.postConstruct()})),this.modelResultCache=null,this.$refs.textArea.setScrollPosition("vertical",0)},postConstruct(){},alignTokens(t){t.forEach((t=>{t.name||(t.name=this.labels[t.id].name);const e=t.tpos[0],s=t.tpos[1],n=t.pos[0],a=t.pos[1];for(let o=0;o<this.tokens.length;o++)this.tokens[o][2]===n?(t.tpos[0]=o,e===s&&(t.tpos[1]=o)):this.tokens[o][2]>n&&this.tokens[o][2]<a&&(t.tpos[1]=o)}))},getDetailedAnnotations(){this.detailedAnnotations=new Array(this.tokens.length).fill(null),this.annotations.forEach((t=>{t.name||(t.name=this.labels[t.id].name);const e=t.tpos[0],s=t.tpos[1],n=t.pos[0],a=t.pos[1];let o;for(let i=0;i<this.tokens.length;i++)this.tokens[i][2]===n?(t.tpos[0]=i,e===s&&(t.tpos[1]=i),o=["B",t],this.detailedAnnotations[i]||(this.detailedAnnotations[i]=[]),this.detailedAnnotations[i].push(o)):this.tokens[i][2]>=n&&this.tokens[i][2]<=a&&(t.tpos[1]=i,o=["I",t],this.detailedAnnotations[i]||(this.detailedAnnotations[i]=[]),this.detailedAnnotations[i].push(o))})),this.getLabelOrder()},getKey(t){return`${t[1].name}-${t[1].pos[0]}-${t[1].pos[1]}`},getLabelOrder(){const t=[];this.detailedAnnotations.forEach(((e,s)=>{if(e){const n={},a=[];let o=Array(e.length).fill().map(((t,e)=>e));e.forEach(((e,o)=>{const i=this.getKey(e);if(0===s)n[i]=o;else if("I"===e[0]){const s=t[e[1].tpos[0]][this.getKey(e)];n[i]=s,a.push(s)}})),o=o.filter((t=>!a.includes(t))),s>0&&e.forEach(((t,e)=>{const s=this.getKey(t);"B"===t[0]&&(n[s]=o.shift())})),t.push(n)}else t.push(null)})),this.annotationOrders=t},getSelection(t){this.highlight(this.documents[0].text,t.start,t.end)},highlight(t,e,s){this.text=`${t.substring(0,e)}<span style="background-color: red">${t.substring(e,s)}</span>${t.substring(s)}`},getTokenOffsetTop(t){const e="t-"+t;return document.getElementById(e).getBoundingClientRect().top},puncts(){console.log("get puncts",new Date);const t=[],e=[",",".",":","!","?","'"];for(let s=0;s<this.tokens.length;s++){const n=this.tokens[s][0][0];t[s]=-1!==e.indexOf(n[0][0])}return console.log("get puncts 2",new Date),t}},computed:{selectedClasses(){const t={};return this.selected.forEach((e=>{t[e]="selected"})),t},progressStats(){const t=this.project.num_of_annotated_docs+this.numAnnotated,e=t/this.project.num_of_docs,s=(100*e).toFixed(2)+"%"+` (${t}/${this.project.num_of_docs})`;return{pct:e,label:s}},categorizedAnnotations(){const t={};return this.annotations.forEach((e=>{[e].forEach((e=>{const s=e.name||this.labels[e.id].name;t[s]?t[s].push(e):t[s]=[e]}))})),t},conflicts(){const t={};this.annotations.forEach((e=>{const s=JSON.stringify(e.pos);t[s]?t[s].push(e):t[s]=[e]}));const e={};return Object.keys(t).forEach((s=>{t[s].length>1&&(e[s]=t[s])})),e},lLabels(){const t={};return Object.entries(this.labels).forEach((e=>{t[e[1].name]=e[1]})),t},tokensInRS(){const t=[];if(this.relevantSentences&&this.relevantSentences.length>0){for(let e=0;e<this.relevantSentences.length;e++){const s=this.relevantSentences[e],n=this.sentences[s].start,a=this.sentences[s].end;for(let e=n;e<a;e++)t.push(e)}return t}}},watch:{}}},"881d":function(t,e,s){"use strict";var n=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("q-btn-dropdown",{staticStyle:{width:"150px"},attrs:{label:t.mode.toUpperCase()+" "+(t.review?"Review":t.consensus?"Consensus":""),"no-caps":"",icon:"ner"===t.mode?"category":"sentence"===t.mode?"view_list":"share",flat:"",align:"between",size:"0.9em","text-color":"primary"}},[s("q-list",{attrs:{separator:""}},[s("q-item",{attrs:{clickable:"",ripple:""},nativeOn:{click:function(e){t.$router.push({name:"annotate",params:{project:t.project,review:t.review,consensus:t.consensus}}).catch((function(t){}))}}},[s("q-item-section",{attrs:{avatar:""}},[s("q-icon",{attrs:{name:"category"}})],1),s("q-item-section",[t._v("\n       NER\n      ")])],1),s("q-item",{attrs:{clickable:"",ripple:""},nativeOn:{click:function(e){t.$router.push({name:"sentenceAnnotate",params:{project:t.project,review:t.review,consensus:t.consensus}}).catch((function(t){}))}}},[s("q-item-section",{attrs:{avatar:""}},[s("q-icon",{attrs:{name:"view_list"}})],1),s("q-item-section",[t._v("\n        Sentence\n      ")])],1),s("q-item",{attrs:{clickable:"",ripple:""},nativeOn:{click:function(e){t.$router.push({name:"relation",params:{project:t.project,review:t.review,consensus:t.consensus}}).catch((function(t){}))}}},[s("q-item-section",{attrs:{avatar:""}},[s("q-icon",{attrs:{name:"share"}})],1),s("q-item-section",[t._v("\n        Relation\n      ")])],1)],1)],1)},a=[],o={name:"AnnotateTab",props:{mode:{type:String,required:!0},project:{type:Object},review:{type:Boolean,default:!1},consensus:{type:Boolean,default:!1}}},i=o,l=s("2877"),c=s("f20b"),r=s("1c1c"),h=s("66e5"),d=s("4074"),u=s("0016"),m=s("eebe"),p=s.n(m),f=Object(l["a"])(i,n,a,!1,null,null,null);e["a"]=f.exports;p()(f,"components",{QBtnDropdown:c["a"],QList:r["a"],QItem:h["a"],QItemSection:d["a"],QIcon:u["a"]})},"9f9a":function(t,e,s){},b465:function(t,e,s){"use strict";s.r(e);var n=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("q-page",{staticStyle:{"background-color":"#f6f6f6"}},[s("div",{staticClass:"row self-start items-center",staticStyle:{"margin-top":"-8px"}},[s("q-breadcrumbs",{staticClass:"justify-start"},[s("q-breadcrumbs-el",{attrs:{label:"My Projects",icon:"home",to:"/"}}),s("q-breadcrumbs-el",{attrs:{label:"Project Summary",icon:"widgets",to:"/project/"+t.project.id}}),s("q-breadcrumbs-el",[s("AnnotateTab",{attrs:{project:t.project,review:t.review,consensus:t.consensus,mode:t.mode}})],1)],1)],1),s("div",{staticClass:"row self-start q-pt-lg"},[this.review?s("div",{staticClass:"col-2"}):s("div",{staticClass:"col-3"},[s("div",{staticClass:"justify-end  q-pr-md row"},[s("q-card",{staticClass:"col-8"},[s("q-linear-progress",{attrs:{size:"25px",value:t.progressStats.pct,color:"accent"}},[s("div",{staticClass:"absolute-full flex flex-center"},[s("q-badge",{attrs:{color:"white","text-color":"accent",label:t.progressStats.label}})],1)]),s("q-tabs",{staticClass:"text-grey",attrs:{dense:"","active-color":"primary","indicator-color":"primary",align:"justify","narrow-indicator":""},model:{value:t.tab,callback:function(e){t.tab=e},expression:"tab"}},[s("q-tab",{attrs:{name:"models",label:t.consensus?"Consensus Models":"Models"}}),t.consensus?t._e():s("q-tab",{attrs:{name:"rules",label:"Rules"}}),t.consensus?t._e():s("q-tab",{attrs:{name:"dicts",label:"Dictionaries"}})],1),s("q-separator"),s("q-tab-panels",{attrs:{animated:""},model:{value:t.tab,callback:function(e){t.tab=e},expression:"tab"}},[t.consensus?s("q-tab-panel",{attrs:{name:"models"}},t._l(t.cmodels,(function(e,n){return s("div",{key:n,staticClass:"q-pa-sm"},[s("q-btn",{staticClass:"bg-primary",attrs:{loading:t.modelQueue.indexOf(t.tab+e.id)>=0,disable:t.getProcessedIn(t.tab+e.id),label:e.name,"text-color":"white"},on:{click:function(s){return t.executeModel(e.id)}},scopedSlots:t._u([{key:"loading",fn:function(){return[s("q-spinner-hourglass",{staticClass:"on-left"}),t._v("\n                      Loading...\n                    ")]},proxy:!0}],null,!0)}),t.cmodels[e.id]&&t.cmodels[e.id].consensusScore?s("div",[t.cmodels[e.id].consensusScore.total?s("span",[s("span",{staticClass:"text-bold text-primary"},[t._v("Accum F1")]),t._v(": "+t._s(t.cmodels[e.id].consensusScore.total.toFixed(1))+"\n                    ")]):t._e(),t.cmodels[e.id].consensusScore.f1?s("span",{staticClass:"q-pl-sm"},[s("span",{staticClass:"text-bold text-positive"},[t._v("F1")]),t._v(": "+t._s(t.cmodels[e.id].consensusScore.f1.toFixed(1))+"\n                    ")]):t._e()]):t._e(),s("q-tooltip",{attrs:{"content-class":"bg-indigo",delay:1e3,offset:[10,10],"max-width":"250px"}},[t._v(" "+t._s(e.note)+" ")])],1)})),0):s("q-tab-panel",{attrs:{name:"models"}},[t._l(t.vmodels,(function(e,n){return s("div",{key:n,staticClass:"q-pa-sm"},[s("q-btn",{staticClass:"bg-primary",attrs:{loading:t.modelQueue.indexOf(t.tab+e.id)>=0,disable:t.getProcessedIn(t.tab+e.id),label:e.name,"text-color":"white"},on:{click:function(s){return t.executeModel(e.id)}},scopedSlots:t._u([{key:"loading",fn:function(){return[s("q-spinner-hourglass",{staticClass:"on-left"}),t._v("\n                      Loading...\n                    ")]},proxy:!0}],null,!0)}),s("q-tooltip",{attrs:{"content-class":"bg-indigo",delay:1e3,offset:[10,10],"max-width":"250px"}},[t._v(" "+t._s(e.note)+" ")])],1)})),0===t.vmodels.length?s("div",[t._v("\n                  No model defined for this project yet\n                ")]):t._e()],2),s("q-tab-panel",{attrs:{name:"rules"}},[t._l(t.rules,(function(e,n){return s("div",{key:n,staticClass:"q-pa-sm"},[s("q-btn",{staticClass:"bg-primary",attrs:{loading:t.modelQueue.indexOf(t.tab+e.id)>=0,disable:t.getProcessedIn(t.tab+e.id),label:e.name,"text-color":"white"},on:{click:function(s){return t.executeModel(e.id)}},scopedSlots:t._u([{key:"loading",fn:function(){return[s("q-spinner-hourglass",{staticClass:"on-left"}),t._v("\n                      Loading...\n                    ")]},proxy:!0}],null,!0)}),s("q-tooltip",{attrs:{"content-class":"bg-indigo",delay:1e3,offset:[10,10],"max-width":"250px"}},[t._v(" "+t._s(e.note)+" ")])],1)})),0===t.rules.length?s("div",[t._v("\n                  No rule defined for this project yet\n                ")]):t._e()],2),s("q-tab-panel",{attrs:{name:"dicts"}},[t._l(t.dicts,(function(e,n){return s("div",{key:n,staticClass:"q-pa-sm"},[s("q-btn",{staticClass:"bg-primary",attrs:{loading:t.modelQueue.indexOf(t.tab+e.id)>=0,disable:t.getProcessedIn(t.tab+e.id),label:e.name,"text-color":"white"},on:{click:function(s){return t.executeModel(e.id)}},scopedSlots:t._u([{key:"loading",fn:function(){return[s("q-spinner-hourglass",{staticClass:"on-left"}),t._v("\n                      Loading...\n                    ")]},proxy:!0}],null,!0)}),s("q-tooltip",{attrs:{"content-class":"bg-indigo",delay:1e3,offset:[10,10],"max-width":"250px"}},[t._v(" "+t._s(e.note)+" ")])],1)})),0===t.dicts.length?s("div",[t._v("\n                  No dictionary defined for this project yet\n                ")]):t._e()],2)],1)],1)],1)]),s("div",{staticClass:"col-6 bg-white"},[s("div",{staticClass:"row justify-end"},[s("div",{staticClass:"col row justify-center"},[t.showUnRelBtn?t._e():s("q-btn",{staticClass:"q-mr-xs",staticStyle:{width:"150px"},attrs:{size:"13px",label:"Hide unrelevant","no-caps":"",color:"primary",outline:"",disable:t.relevantSentences.length<1},on:{click:function(e){t.hideUnRelSen(),t.showUnRelBtn=!0}}}),t.showUnRelBtn?s("q-btn",{staticClass:"q-mr-xs",staticStyle:{width:"100px"},attrs:{size:"13px",label:"Show all",flat:"","no-caps":""},on:{click:function(e){t.showUnRelSen(),t.showUnRelBtn=!1}}}):t._e()],1),s("div",{staticClass:"self-center",staticStyle:{width:"137px"}},[s("q-checkbox",{staticStyle:{width:"140px","margin-left":"1px"},attrs:{dense:"",label:"Select all"},model:{value:t.relevantAll,callback:function(e){t.relevantAll=e},expression:"relevantAll"}})],1)]),s("q-separator"),s("q-scroll-area",{ref:"textArea",staticClass:"col",staticStyle:{height:"calc(100vh - 200px)",display:"flex"}},[t.sentences&&t.sentences.length>0?s("div",{staticClass:"select-box q-px-sm",attrs:{tabindex:"0"}},t._l(t.sentences,(function(e,n){return s("div",{directives:[{name:"show",rawName:"v-show",value:t.relevantSenShow[n],expression:"relevantSenShow[i]"}],key:n,staticClass:"sentence row col-12 q-px-sm",class:t.getSentenceClass(n),staticStyle:{"border-radius":"10px"},attrs:{id:"s-"+n}},[s("div",{staticClass:"q-py-sm col",on:{click:function(e){return t.showDetailSenAnnos(n)}}},[s("div",{staticClass:"row col-12"},[t._v("\n                  "+t._s(e.text)+"\n                ")]),s("div",{staticClass:"row col-12"},t._l(t.catAnnotations[n].labels,(function(e,a){return s("div",{key:a,staticClass:"column justify-start q-mx-xs q-py-xs",staticStyle:{border:"1px solid lightgrey","border-radius":"5px","font-size":"0.8em"}},[s("div",{staticClass:" q-pl-xs text-bold"},[t._v(t._s(a)+" ")]),s("div",{},[s("q-chip",{style:"background-color: "+e.color,attrs:{dense:"",removable:!t.review},on:{remove:function(e){return t.removeAnnotation(n,a)}}},[e.m&&!t.review?s("q-avatar",{attrs:{color:"white","text-color":"black",size:"16px"}},[t._v("\n                          m\n                        ")]):t._e(),t.review?s("q-avatar",{attrs:{color:"white","text-color":"black",size:"16px"}},[s("span",{staticClass:"text-bold",staticStyle:{"font-size":"1.5em"}},[t._v(t._s(e.authors.length))])]):t._e(),t._v("\n                        "+t._s(e.name)+"\n                      ")],1)],1),t._l(e.extra,(function(e,n){return s("div",{key:"e"+n},[s("q-chip",{style:"background-color: "+e.color,attrs:{dense:""}},[t.review?s("q-avatar",{attrs:{color:"white","text-color":"black",size:"16px"}},[s("span",{staticClass:"text-bold",staticStyle:{"font-size":"1.5em"}},[t._v(t._s(e.authors.length))])]):t._e(),t._v("\n                        "+t._s(e.name)+"\n                      ")],1)],1)}))],2)})),0)]),s("div",{staticClass:"row justify-between items-center q-pa-xs cat-labels",staticStyle:{"border-left":"solid 1px #bbb",width:"125px"}},[s("q-checkbox",{attrs:{val:n,dense:""},model:{value:t.relevantSentences,callback:function(e){t.relevantSentences=e},expression:"relevantSentences"}}),s("div",[s("q-btn-dropdown",{staticClass:"row",attrs:{label:"label",size:"sm",color:"primary","menu-anchor":"bottom end","menu-offset":[48,0]}},[s("q-list",{staticStyle:{"min-width":"100px"},attrs:{dense:""}},t._l(t.categoryNames,(function(e,a){return s("q-item",{key:"cat-"+n+"-"+a,attrs:{clickable:""}},[s("q-item-section",[t._v(t._s(e))]),s("q-item-section",{attrs:{side:""}},[s("q-icon",{attrs:{name:"keyboard_arrow_right"}})],1),s("q-menu",{attrs:{"auto-close":"",anchor:"top end",self:"top start"}},[s("q-list",{staticStyle:{"min-width":"100px"},attrs:{dense:""}},t._l(t.category[e].labels,(function(a,o){return s("q-item",{key:"label-"+o,staticClass:"row items-center",attrs:{clickable:""},nativeOn:{click:function(s){t.catAnnotations[n].labels[e]=a,t.annotate(n)}}},[t.catAnnotations[n].labels[e]&&t.catAnnotations[n].labels[e].name===a.name?s("q-icon",{attrs:{name:"check"}}):s("span",{staticStyle:{width:"1em"}}),s("span",{staticClass:"q-pl-xs"},[t._v(" "+t._s(a.name)+" ")])],1)})),1)],1)],1)})),1)],1)],1)],1)])})),0):t._e()]),s("q-separator"),s("q-card-actions",{staticClass:"justify-center"},[s("div",{staticClass:"row items-center"},[t._v("\n              Go to page "),s("q-input",{staticClass:"q-pl-xs",staticStyle:{"max-width":"5em"},attrs:{type:"number",dense:""},model:{value:t.go2page,callback:function(e){t.go2page=t._n(e)},expression:"go2page"}}),s("q-btn",{staticClass:"float-right q-ml-md",attrs:{color:"primary",label:"Go"},on:{click:function(e){return t.fetchDocs({page:t.go2page})}}})],1),s("q-space"),s("q-btn",{staticClass:"justify-center",staticStyle:{width:"100px"},attrs:{color:"primary",label:"Previous",disable:!t.prevURL},on:{click:function(e){return t.goto(t.prevURL)}}}),s("q-btn",{staticClass:"justify-center q-ml-md",staticStyle:{width:"100px"},attrs:{color:"accent",label:"Save",loading:t.saving},on:{click:function(e){return t.formatAndSaveAnnotations()}},scopedSlots:t._u([{key:"loading",fn:function(){return[t._v("\n                     Saving...\n                   ")]},proxy:!0}])}),s("q-btn",{staticClass:"justify-center q-ml-md",staticStyle:{width:"100px"},attrs:{color:"primary",label:"Next"},on:{click:function(e){return t.goto(t.nextURL)}}})],1)],1),s("div",{staticClass:"col-2 summary q-mb-none"},[s("q-card",[s("q-card-actions",{staticClass:"bg-accent annotation-header justify-between",style:"color: white; font-weight: bold; font-size: 1.2em"},[s("q-btn",{class:{"bg-purple-5":"annotations"==t.showTab},attrs:{label:"ANNOTATIONS",flat:""},on:{click:function(e){t.showTab="annotations"}}}),s("q-btn",{staticClass:"float-right",class:{"bg-purple-5":"sort"==t.showTab},attrs:{icon:"sort",flat:""},on:{click:function(e){t.showTab="sort"}}},[t.modelResultCache?s("q-badge",{attrs:{color:"info",floating:""}},[t._v(" "+t._s(t.modelResultCache.length))]):t._e()],1),t.review?s("q-btn",{staticClass:"float-right",class:{"bg-purple-5":"annotators"==t.showTab},attrs:{icon:"group",flat:""},on:{click:function(e){t.showTab="annotators"}}},[t.annotations4Review?s("q-badge",{attrs:{color:"info",floating:""}},[t._v(" "+t._s(Object.keys(t.annotations4Review).length))]):t._e()],1):t._e(),s("q-btn",{staticClass:"float-right",class:{"bg-purple-5":"conflicts"==t.showTab},attrs:{icon:"visibility",flat:""},on:{click:function(e){t.showTab="conflicts"}}},[s("q-badge",{attrs:{color:"red",floating:""}},[t._v(t._s(Object.keys(t.conflicts).length))])],1)],1),s("q-scroll-area",{staticClass:"col",staticStyle:{height:"calc(100vh - 180px)",display:"flex"}},[t.curDetailSentence&&"annotations"===t.showTab?s("q-list",{staticClass:"bg-white",attrs:{bordered:""}},t._l(t.catAnnotations[t.curDetailSentence].labels,(function(e,n){return s("q-expansion-item",{key:n,attrs:{"expand-separator":"","header-class":"header-label","default-opened":"",label:n}},[s("div",[s("div",{staticClass:"summary-word"},[e.m?s("q-avatar",{attrs:{color:"red",size:"12px","text-color":"white"},on:{click:function(e){return t.removeAnnotation(t.curDetailSentence)}}},[t._v(" m ")]):t._e(),s("span",[t._v("\n                      [ "+t._s(t.sentences[t.curDetailSentence].start_char)+", "+t._s(t.sentences[t.curDetailSentence].end_char)+" ] -\n                      "),s("span",{staticClass:"text-bold"},[t._v(t._s(e.name))])])],1),s("div",{staticClass:"column",staticStyle:{"padding-left":"3em"}},t._l(e.authors,(function(e,n){return s("span",{key:"author-"+n},[t._v("\n                      "+t._s(e)+"\n                    ")])})),0)]),t._l(e.extra,(function(e,n){return s("div",{key:n},[s("div",{staticClass:"summary-word"},[s("span",[t._v("\n                      [ "+t._s(t.sentences[t.curDetailSentence].start_char)+", "+t._s(t.sentences[t.curDetailSentence].end_char)+" ] -\n                      "),s("span",{staticClass:"text-bold"},[t._v(t._s(e.name))])])]),s("div",{staticClass:"column",staticStyle:{"padding-left":"3em"}},t._l(e.authors,(function(e,n){return s("span",{key:"author-"+n},[t._v("\n                      "+t._s(e)+"\n                    ")])})),0)])}))],2)})),1):t._e(),t.tokens&&t.modelResultCache&&"sort"===t.showTab?s("q-list",{staticClass:"q-pa-sm"},[t._l(t.modelResultCache,(function(e,n){return s("div",{key:n},[s("q-avatar",{attrs:{color:"red",size:"12px","text-color":"white"},on:{click:function(s){t.removeAnnotation(e.si,e.category),t.removeFromModelCache(e.tpos[0],e)}}},[t._v(" m ")]),s("span",{on:{click:function(s){t.scrollTo(t.getSentence(e.pos))}}},[e.confidence?s("span",[t._v("("+t._s(e.confidence.toFixed(2))+")")]):t._e(),t._v("\n                    "+t._s(e.pos)+" - "+t._s(e.category)+": "+t._s(e.name)+"\n                ")])],1)})),s("div",{staticClass:"flex justify-center"},[s("q-btn",{staticClass:"q-mt-sm",attrs:{label:"Clear model results",color:"primary"},on:{click:function(e){t.modelResultCache=null}}})],1)],2):t._e(),t.tokens&&"conflicts"===t.showTab?s("q-list",{staticClass:"bg-white",attrs:{bordered:"",separator:""}},[0===Object.keys(t.conflicts).length?s("span",{staticClass:"text-subtitle2 q-pa-sm"},[t._v(" Cool, there is no conflict")]):t._e(),t._l(Object.entries(t.conflicts),(function(e,n){return s("q-item",{key:n,attrs:{label:e[0]+" ("+e[1].length+")"}},[s("div",{},t._l(e[1],(function(e,n){return s("div",{key:n,staticStyle:{"list-style":"circle"}},[s("span",[e.m?s("q-avatar",{attrs:{color:"red",size:"12px","text-color":"white"},on:{click:function(s){return t.removeAnnotation(e.pos,e)}}},[t._v(" m ")]):s("q-avatar",{attrs:{size:"12px"}}),s("span",{on:{click:function(s){t.scrollTo(t.getSentence(e.pos))}}},[t._v(t._s(e.pos)+" - "+t._s(e.text)+" 【"+t._s(e.name)+"】")])],1)])})),0)])}))],2):t._e(),t.tokens&&"annotators"===t.showTab?s("q-list",{staticClass:"bg-white",attrs:{bordered:"",separator:""}},t._l(t.annotations4Review,(function(e,n,a){return s("q-item",{directives:[{name:"ripple",rawName:"v-ripple"}],key:a,staticClass:"q-pr-xs",attrs:{clickable:"",active:t.activeAuthors.includes(n),"active-class":"bg-blue-3 text-grey-8"}},[s("q-item-section",[s("div",{staticClass:"col-9",on:{click:function(e){return t.getAnnotations(n)}}},[t._v(t._s(e.author)+" ("+t._s(e.annotations.length)+")")])]),s("q-item-section",{attrs:{side:""}},[s("q-btn-dropdown",{attrs:{color:"primary",flat:"",size:"sm",dense:"",label:"","dropdown-icon":{1:"check_circle","-1":"highlight_off",2:"redo"}[e.status]}},[s("q-list",{attrs:{bordered:""}},[s("q-item",{directives:[{name:"ripple",rawName:"v-ripple"}],class:{"text-positive":1===e.status},attrs:{dense:"",clickable:""},on:{click:function(s){return t.rejectOrAccept(e,1)}}},[s("q-item-section",{attrs:{avatar:""}},[s("q-icon",{attrs:{name:1===e.status?"check_circle":"check",flat:"",size:"sm"}})],1),s("q-item-section",[t._v("\n                          Accept\n                        ")])],1),s("q-item",{directives:[{name:"ripple",rawName:"v-ripple"}],class:{"text-negative":-1===e.status},attrs:{clickable:""},on:{click:function(s){return t.rejectOrAccept(e,-1)}}},[s("q-item-section",{attrs:{avatar:""}},[s("q-icon",{attrs:{name:-1===e.status?"highlight_off":"clear",flat:"",size:"sm"}})],1),s("q-item-section",[t._v("\n                          Reject\n                        ")])],1),s("q-item",{directives:[{name:"ripple",rawName:"v-ripple"}],class:{"text-negative":2===e.status},attrs:{clickable:""},on:{click:function(s){return t.rejectOrAccept(e,2)}}},[s("q-item-section",{attrs:{avatar:""}},[s("q-icon",{attrs:{name:"redo",flat:"",size:"sm"}})],1),s("q-item-section",[t._v("\n                          Ask for redo\n                        ")])],1)],1)],1)],1)],1)})),1):t._e()],1)],1)],1)])])},a=[],o=s("ded3"),i=s.n(o),l=(s("4e82"),s("ddb0"),s("79df")),c=s("881d"),r={name:"SentenceAnnotate",mixins:[l["a"]],components:{AnnotateTab:c["a"]},data(){return{mode:"sentence",catAnnotations:[],relevantSentences:[],relevantAll:!1,category:null,relevantSenShow:[],showUnRelBtn:!1,curDetailSentence:null}},mounted(){this.project.labels.filter((t=>t.kind===this.mode)).forEach((t=>{this.labels[t.id]=t,this.labelNames.add(t.name)}))},methods:{goto(t){t?(this.fetchDocs({url:t}),this.relevantSentences=[]):this.$router.push("/")},selectStart(t){},selectEnd(t){},select(t){},getSentenceClass(t){return this.curDetailSentence===t?"cur":this.relevantSentences.includes(t)?"highlight":""},postConstruct(){const t=this.sentences.length;this.relevantSenShow=Array(t).fill(!0),this.category={},Object.values(this.labels).forEach((t=>{t.category&&(this.category[t.category]?(this.category[t.category].labels.push(t),this.category[t.category].names.push(t.name)):this.category[t.category]={labels:[t],names:[t.name]})})),this.prepareCatAnnotations()},prepareCatAnnotations(){this.catAnnotations=Array(this.sentences.length).fill({}).map((t=>{const e={};return{labels:e}})),this.annotations.forEach(((t,e)=>{const s=this.getSentence(t.pos);if(this.catAnnotations[s].pos=t.pos,this.catAnnotations[s].tpos=t.tpos,this.catAnnotations[s].text=t.text,this.catAnnotations[s].labels||(this.catAnnotations[s].labels={}),this.catAnnotations[s].labels[t.category]){this.catAnnotations[s].labels[t.category].extra||(this.catAnnotations[s].labels[t.category].extra=[]);const e=i()({},this.labels[t.id]);e.authors=t.authors,this.catAnnotations[s].labels[t.category].extra.push(e)}else this.catAnnotations[s].labels[t.category]=i()({},this.labels[t.id]),this.catAnnotations[s].labels[t.category].authors=t.authors;t.m&&(this.catAnnotations[s].labels[t.category].m=t.m)}))},getSentence(t){for(let e=0;e<this.sentences.length;e++)if(this.sentences[e].start_char===t[0])return e},annotate(t){this.$forceUpdate()},formatAndSaveAnnotations(){this.annotations=[],this.catAnnotations.forEach(((t,e)=>{Object.keys(t.labels).length>0&&Object.keys(t.labels).forEach((s=>{const n={};n.text=this.sentences[e].text,n.pos=[this.sentences[e].start_char,this.sentences[e].end_char],n.tpos=[this.sentences[e].start,this.sentences[e].end],n.name=t.labels[s].name,n.category=t.labels[s].category,n.id=t.labels[s].id,n.m=t.labels[s].m,this.annotations.push(n)}))})),this.saveAnnotations(),this.saveRelated()},saveRelated(){const t={document:this.document.id,annotations:this.relevantSentences,kind:"related"};let e,s;this.document.relations.id?(e="patch",s=this.$hostname+"/api/annotations/"+this.document.relations.id+"/"):(e="post",s=this.$hostname+"/api/annotations/"),this.$axios({method:e,url:s,data:t}).then((t=>{console.log(t.data)}))},executeModel(t){if(0===this.relevantSentences.length){const t="You must select some sentences before execute model.";return this.$q.notify({message:t,color:"secondary",position:"center",actions:[{label:"Dismiss",color:"white",handler:()=>{}}]}),-1}this.add2Q(t);const e={mtype:this.tab,id:t,sentences:[]};this.relevantSentences.forEach((t=>{e.sentences.push({text:this.sentences[t].text,idx:t})}));const s=this.consensus?"/api/calculate_consensus/":"/api/model-sentence/";this.$axios.post(this.$hostname+s,e).then((e=>{const s=e.data,n=[];s.forEach(((t,e)=>{const s=this.sentences[t.idx],a=i()({},this.lLabels[t.category][t.label]);a.m="m";const o={id:a.id,pos:[s.start_char,s.end_char],tpos:[s.start,s.end],name:t.label,text:s.text,si:t.idx,category:t.category,m:"m"};this.catAnnotations[t.idx].labels[t.category]||(this.catAnnotations[t.idx].labels[t.category]=a,n.push(o))})),this.removeFromQ(t),this.modelResultCache?this.modelResultCache=this.modelResultCache.concat(n):this.modelResultCache=n,this.modelResultCache.sort(((t,e)=>e.confidence-t.confidence));const a=`Finished running model, and got ${s.length} results`;this.$q.notify({message:a,color:"secondary",position:"center",timeout:0,actions:[{label:"Dismiss",color:"white",handler:()=>{}},{label:"Review",color:"white",handler:()=>{this.showTab="sort"}}]}),this.$forceUpdate()})).catch((e=>{console.log(e.response.data.error),this.alertServerErr(),this.removeFromQ(t)}))},removeFromQ(t){const e=this.tab+t,s=this.modelQueue.indexOf(e);this.modelQueue.splice(s,1),Object.values(this.relevantSentences).forEach((t=>{this.processedQ.push(e+t)}))},removeAnnotation(t,e){delete this.catAnnotations[t].labels[e],this.$forceUpdate()},showDetailSenAnnos(t){this.curDetailSentence===t?this.curDetailSentence=null:this.curDetailSentence=t},hideUnRelSen(){this.relevantSenShow=Array(this.sentences.length).fill(!1),this.relevantSentences.forEach((t=>{this.relevantSenShow[t]=!0}))},showUnRelSen(){this.relevantSenShow=Array(this.sentences.length).fill(!0)},scrollTo(t){const e=`s-${t}`;document.getElementById(e).scrollIntoView({block:"center"})}},computed:{getProcessedIn(){return function(t){for(let e=0;e<this.relevantSentences.length;e++){const s=t+this.relevantSentences[e];if(this.processedQ.indexOf(s)>=0)return!0}return!1}},categoryNames(){return Object.keys(this.category)},categorizedAnnotations(){const t={};if(null===this.curDetailSentence)return t;const e=this.catAnnotations[this.curDetailSentence].labels;return 0!==Object.keys(e).length&&Object.keys(e).filter((t=>null!==e[t])).forEach((s=>{t[s]?t[s].push(e[s]):t[s]=[e[s]]})),t},lLabels(){const t={};return Object.entries(this.labels).forEach((([e,s])=>{t[s.category]=t[s.category]||{},t[s.category][s.name]=s})),t},conflicts(){const t={};this.annotations.forEach((e=>{const s=`${JSON.stringify(e.pos)}-${e.id}`;t[s]?t[s].push(e):t[s]=[e]}));const e={};return Object.keys(t).forEach((s=>{t[s].length>1&&(e[s]=t[s])})),e}},watch:{relevantSentences(t){this.relevantAll=t.length===this.sentences.length},relevantAll(t){!0===t?this.relevantSentences=[...Array(this.sentences.length).keys()].map((t=>t)):this.relevantSentences.length===this.sentences.length&&(this.relevantSentences=[])}}},h=r,d=(s("d5ec"),s("2877")),u=s("9989"),m=s("ead5"),p=s("079e"),f=s("f09f"),g=s("6b1d"),b=s("58a81"),v=s("429b"),y=s("7460"),x=s("eb85"),w=s("adad"),_=s("823b"),q=s("9c40"),k=s("9149"),S=s("05c0"),A=s("8f8e"),C=s("4983"),j=s("b047"),Q=s("cb32"),R=s("f20b"),$=s("1c1c"),O=s("66e5"),E=s("4074"),D=s("0016"),T=s("4e73"),L=s("ddd8"),I=s("4b7e"),U=s("27f9"),B=s("2c91"),z=s("3b73"),N=s("714f"),P=s("eebe"),F=s.n(P),M=Object(d["a"])(h,n,a,!1,null,null,null);e["default"]=M.exports;F()(M,"components",{QPage:u["a"],QBreadcrumbs:m["a"],QBreadcrumbsEl:p["a"],QCard:f["a"],QLinearProgress:g["a"],QBadge:b["a"],QTabs:v["a"],QTab:y["a"],QSeparator:x["a"],QTabPanels:w["a"],QTabPanel:_["a"],QBtn:q["a"],QSpinnerHourglass:k["a"],QTooltip:S["a"],QCheckbox:A["a"],QScrollArea:C["a"],QChip:j["a"],QAvatar:Q["a"],QBtnDropdown:R["a"],QList:$["a"],QItem:O["a"],QItemSection:E["a"],QIcon:D["a"],QMenu:T["a"],QSelect:L["a"],QCardActions:I["a"],QInput:U["a"],QSpace:B["a"],QExpansionItem:z["a"]}),F()(M,"directives",{Ripple:N["a"]})},d5ec:function(t,e,s){"use strict";s("9f9a")}}]);