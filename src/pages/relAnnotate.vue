<template>
  <q-page class="" style="background-color: #f6f6f6">
    <div class="row self-start items-center" style="margin-top:-8px">
      <q-breadcrumbs class="justify-start">
        <q-breadcrumbs-el label="My Projects" icon="home" to="/" />
        <q-breadcrumbs-el label="Project Summary" icon="widgets" :to="`/project/${project.id}`" />
        <q-breadcrumbs-el>
          <AnnotateTab :project="project" :review="review" :consensus="consensus" :mode="mode" />
        </q-breadcrumbs-el>
<!--        <q-breadcrumbs-el :label="review? 'Review': consensus? 'Check Consensus': 'Ner Annotate'" icon="navigation" />-->
      </q-breadcrumbs>
    </div>
    <div class="row self-start q-pt-lg">
      <div class="col-3" v-if="!this.review">
        <div class="justify-end  q-pr-md row">
          <q-card class="col-8">
            <q-linear-progress size="25px" :value="progressStats.pct" color="accent">
              <div class="absolute-full flex flex-center">
                <q-badge color="white" text-color="accent"
                         :label="progressStats.label" />
              </div>
            </q-linear-progress>

            <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
              <q-tab name="models" :label="consensus? 'Consensus Models' : 'Models'"/>
              <q-tab v-if="!consensus" name="rules" label="Rules"/>
              <q-tab v-if="!consensus" name="dicts" label="Dictionaries"/>
            </q-tabs>

            <q-separator/>

            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="models" v-if="!consensus">
                <div v-for="(m,i) in vmodels" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab+m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                         :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="vmodels.length===0">
                  No model defined for this project yet
                </div>
              </q-tab-panel>

<!--              consensus model results-->
              <q-tab-panel name="models" v-else>
                <div v-for="(m,i) in cmodels" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab+m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                         :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
<!--                  <q-circular-progress v-if="cmodels[m.id] && cmodels[m.id].consensusScore.total" show-value font-size="12px" :value="cmodels[m.id].consensusScore.total"-->
<!--                                       size="35px" :thickness="0.22" color="red" track-color="grey-3" class="q-ma-xs">-->
<!--                    {{ cmodels[m.id].consensusScore.total.toFixed(1) }}-->
<!--                  </q-circular-progress>-->
<!--                  <q-circular-progress v-if="cmodels[m.id] && cmodels[m.id].consensusScore.f1" show-value font-size="12px" :value="cmodels[m.id].consensusScore.f1"-->
<!--                                       size="35px" :thickness="0.22" color="teal" track-color="grey-3" class="q-ma-xs">-->
<!--                    {{ cmodels[m.id].consensusScore.f1.toFixed(1) }}-->
<!--                  </q-circular-progress>-->
                  <div v-if="cmodels[m.id] && cmodels[m.id].consensusScore">
                    <span v-if="cmodels[m.id].consensusScore.total">
                      <span class="text-bold text-primary">Accum F1</span>: {{ cmodels[m.id].consensusScore.total.toFixed(1) }}
                    </span>
                    <span v-if="cmodels[m.id].consensusScore.f1" class="q-pl-sm">
                      <span class="text-bold text-positive">F1</span>: {{ cmodels[m.id].consensusScore.f1.toFixed(1) }}
                    </span>
                  </div>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
              </q-tab-panel>

              <q-tab-panel name="rules">
                <div v-for="(m,i) in rules" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab + m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                    :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="rules.length===0">
                  No rule defined for this project yet
                </div>
              </q-tab-panel>

              <q-tab-panel name="dicts">
                <div v-for="(m,i) in dicts" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab + m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                    :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="dicts.length===0">
                  No dictionary defined for this project yet
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
      <div v-else class="col-2"></div>

      <div class="col-6 bg-white">
        <q-card-actions class="bg-white annotation-header">
          <div class="row full-width">
            <div class="col-12 text-center">
              <q-btn v-if="relevantSentences.length>0" :label="showUnRelated? 'Hide unrelated': 'Show all'" class="q-mr-xs" style="width: 100px" flat no-caps size="sm"
                     @click="showUnRelated=!showUnRelated">
              </q-btn>
            </div>
            <div class="row items-center justify-between" style="width: 282px">
              <div class="row justify-between col-12">
                <q-btn outline :label="relation.head.text" no-caps
                       class="q-mr-xs" style="width: 120px;"></q-btn> <br>
                <q-btn icon="swap_horiz" size="sm" flat @click="switchHeadTail()"/>
                <q-btn outline :label="relation.tail.text" no-caps
                       class="q-mr-xs" style="width: 120px;"></q-btn>
              </div>
              <div class="row justify-around col-12">
                <span @click="relation.head={}">Head</span>
                <span @click="relation.tail={}">Tail</span>
              </div>
            </div>
            <div class="col row self-center q-px-sm">
              <div class="row items-start">
                <q-btn-dropdown color="primary" unelevated :label="relation.relation? relation.relation.name : 'relation'">
                  <q-list>
                    <q-item v-for="(label, i) in relationLabels" :key="i" clickable v-close-popup dense @click="setLabel(label)">
                      <q-item-label>
                        {{ label.name}}
                      </q-item-label>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
              <q-input dense class="col q-ml-sm" v-model="relation.hint.text" label="suggesting text"
                       hint="select or manually type text which suggests such relation" filled />
            </div>
            <div class="column self-center">
              <q-btn color="primary" size="sm" class="block float-right" @click="resetRelation()">Reset</q-btn>
              <q-btn color="accent" size="sm" class="q-mt-xs block float-right" :disable="!goodRelation"
                     @click="confirmRelation()" >Confirm</q-btn>
            </div>
          </div>
        </q-card-actions>
        <q-separator />
        <q-scroll-area style="height: calc(100vh - 200px); display: flex" class="col" ref="textArea">
          <div v-if="tokens && tokens.length>0" class="select-box q-pa-sm" @keyup="key" tabindex="0"
               @focusout="selected=[]" >
            <svg style="position:absolute; width: 100%; height: 100%;">
              <defs>
                <marker id='head' orient="auto"
                        markerWidth='6' markerHeight='4'
                        refX='0.1' refY='2'>
                  <!-- triangle pointing right (+x) -->
                  <path d='M0,0 V4 L2,2 Z' fill="green"/>
                </marker>
              </defs>
              <path :id="`rel-${1}`" marker-end='url(#head)' d="M0 0" stroke="green"
                    stroke-width="3" stroke-linecap="round" fill="transparent"></path>
            </svg>
            <div v-for="(token,i) in (showUnRelated? tokens: tokens)" :key="i" :id="`t-${i}`" :class="getTokenBlockClass(token, i)">
              <!-- each token display -->
              <span class="q-pt-xs token" :id="selected[0]===i? 'selected' : null"
                    v-on:mousedown="selectStart(i);mousePressed=true"
                    v-on:mouseup="selectEnd(i);mousePressed=false;addRelationText()"
                    v-on:mouseover="mousePressed && select(i)"
                    style="position:relative">
<!--                <span style="white-space: pre" :class="getTokenClass(i)" v-if="!puncts[i]">&nbsp;</span>-->
                <span :class="getTokenClass(i)" >{{ token[0] }}</span>
<!--                underline -->
<!--                <span v-if="detailedAnnotations[i] && detailedAnnotations[i].length>0" style="position: relative">-->
                  <div v-for="(label,k) in detailedAnnotations[i]" :key="k" :class="`${getPosOfLabel(i,k,label).order}`"
                    :style="getPosOfLabel(i,k,label).cls">
                  </div>
<!--                </span>-->
              </span>
              <!-- dropdown menu for labels -->
<!--              <q-card v-if="selected[0]===i" class="label-window fixed q-px-md q-py-sm" id="label-window" :style="`top: ${offsetTop}px;`">-->
<!--                <div v-for="(label,k) in labels" :key="k" class="col-12" :style="`color:${label.color}`">-->
<!--                  <div v-if="detailedAnnotations[i] && detailedAnnotations[i].map(a=>a[1].id).includes(label.id)"-->
<!--                       @click="removeAnnotation(i, findAnnotation(i, label.id))">-->
<!--                    <q-icon name="check_circle"></q-icon>-->
<!--                    {{ label.name }}-->
<!--                  </div>-->
<!--                  <div v-else @click="annotate(label)">-->
<!--                    <q-icon name="radio_button_unchecked"></q-icon>-->
<!--                    {{ label.name }}-->
<!--                  </div>-->
<!--                </div>-->
<!--              </q-card>-->
              <!-- display label under token -->
<!--              <span v-if="detailedAnnotations[i] && detailedAnnotations[i].length>0" style="position: absolute;" :style="`margin-top: ${2.0}em`">-->
<!--                <div v-for="(label,k) in detailedAnnotations[i]" :key="k">-->
<!--                  <div v-if="label[0]==='B'" :style="`width:${getWidth(i,k)}px;height: ${1*(k+1)}px; border-bottom: solid ${getColor(label[1])} 1px; margin-left: ${k*2}px`"></div>-->
<!--                </div>-->
<!--              </span>-->
              <span v-if="detailedAnnotations[i]" @mouseover="activeLabel=`l-${i}`" @mouseleave="activeLabel=null"
                    :class="{'active-label shadow-4': activeLabel===`l-${i}`}" class="label"
                    style="position: absolute;" :style="`margin-top: ${2.2+detailedAnnotations[i].length*0.25+prevTight(i)}em`" :id="`l-${i}`">
                <span v-for="(label,j) in detailedAnnotations[i]" :key="`label${j}`" class="label" :style="`color:${getColor(label[1])}`">
                  <span v-if="label[0]==='B'" :style="`margin-left:${j*2-4}px`">
<!--                    <q-avatar :style="`background-color:${getColor(label[1])}`" text-color="white" size="12px" v-if="label[1].m" @click="removeAnnotation(i, label[1])">-->
<!--                      m-->
<!--                    </q-avatar>-->
<!--                    <q-icon v-else name="check_circle" @click="removeAnnotation(i, label[1])"/>-->
                    <span @click="setHeadTail(label[1])">{{ label[1].name }}</span>
                  </span>
                </span>
              </span>
              <span v-if="detailedAnnotations[i]" :style="`height: ${detailedAnnotations[i].filter(a=>a[0]=='B').length*18 + detailedAnnotations[i].length*4 }px` "> </span>
            </div>
          </div>
        </q-scroll-area>
        <q-separator />
          <q-card-actions class="justify-center">
            <div class="row items-center">
              Go to page <q-input v-model.number="go2page" type="number" dense style="max-width: 5em" class="q-pl-xs" />
              <q-btn color="primary" label="Go" class="float-right q-ml-md"
                     @click="fetchDocs({page: go2page})" />
            </div>
            <q-space />
            <q-btn color="primary" label="Previous" :disable="!prevURL" class="justify-center"
                   @click="fetchDocs({url:prevURL})" style="width: 100px"/>
            <q-btn color="accent" label="Save" class="justify-center q-ml-md" @click="saveAnnotations()"
                   :disable="!ableSave"
                   :loading="saving" style="width: 100px">
                   <template v-slot:loading>
                     Saving...
                   </template>
            </q-btn>
            <q-btn color="primary" label="Next" class="justify-center q-ml-md"
                   @click="nextURL? fetchDocs({url: nextURL}): $router.push('/')" style="width: 100px"/>
          </q-card-actions>
      </div>

      <div class="col-3 summary q-mb-none">
        <q-card>
          <q-card-actions class="bg-accent annotation-header justify-between" :style="'color: white; font-weight: bold; font-size: 1.2em'">
            <q-btn label="ANNOTATIONS" flat @click="showTab='annotations'" :class="{'bg-purple-5': showTab=='annotations'}">
              <q-badge color="info" floating> {{relations.length}}</q-badge>
            </q-btn>
            <q-btn icon="sort" class="float-right" flat @click="showTab='sort'" :class="{'bg-purple-5': showTab=='sort'}">
              <q-badge color="info" floating v-if="modelResultCache"> {{modelResultCache.length}}</q-badge>
            </q-btn>
            <q-btn v-if="review" icon="group" class="float-right" flat @click="showTab='annotators'" :class="{'bg-purple-5': showTab=='annotators'}">
              <q-badge color="info" floating v-if="annotations4Review"> {{Object.keys(annotations4Review).length}}</q-badge>
            </q-btn>
            <q-btn icon="visibility" class="float-right" flat @click="showTab='conflicts'" :class="{'bg-purple-5': showTab=='conflicts'}">
              <q-badge color="red" floating>{{ Object.keys(conflicts).length }}</q-badge>
            </q-btn>
          </q-card-actions>
          <q-scroll-area style="height: calc(100vh - 180px); display: flex" class="col">
<!--            categorized annotations-->
            <relation-list  v-if="tokens && showTab==='annotations'" :relations="relations"
                            @remove="removeRelation($event)"
                            @select="relation=$event; drawRelation($event)"/>
<!--            model results review -->
            <relation-list  v-if="tokens && modelResultCache && showTab==='sort'"
                            :relations="modelResultCache"
                            :showAccept="true"
                            @remove="removeRelationFromModelCache($event)"
                            @accept="relations.push($event);removeRelationFromModelCache($event)"
                            @select="relation=$event; drawRelation($event)"/>
            <div v-if="tokens && modelResultCache && showTab==='sort'" class="flex justify-center">
              <q-btn label="Clear model results" color="primary" @click="modelResultCache=null" class="q-mt-sm"/>
            </div>
<!--            conflict-->
            <q-list bordered separator class="bg-white" v-if="tokens && showTab==='conflicts'">
              <span v-if="Object.keys(conflicts).length===0" class="text-subtitle2 q-pa-sm"> Cool, there is no conflict</span>
              <q-item v-for="(label, i) in Object.entries(conflicts)" :key="i"
                                :label="`${label[0]} (${label[1].length})`">
                 <div class="">
                  <div v-for="(w, j) in label[1]" :key="j" style="list-style: circle">
                    <span>
                      <q-avatar v-if="w.m" color="red" size="12px" text-color="white" @click="removeAnnotation(w.tpos[0], w)"> m </q-avatar>
                      <q-avatar v-else size="12px"></q-avatar>
                      <span @click="scrollTo(w)">{{w.pos}} - {{w.text}} 【{{w.name}}】</span>
                    </span>
                  </div>
                </div>
              </q-item>
            </q-list>
<!--            list of annotators-->
            <q-list bordered separator class="bg-white" v-if="tokens && showTab==='annotators'">
              <q-expansion-item v-for="(anns, author, i) in annotations4Review" :key="i" clickable v-ripple class="q-pr-xs"
                                :label="`${anns.author} (${anns.annotations.length})`"
                                :active="activeAuthors.includes(author)"
                                @click="getAnnotations(author)"
                                group="review" active-class="bg-blue-3 text-grey-8">
<!--                <q-item-section side>-->
<!--                  <q-btn-dropdown color="primary" flat size="sm" dense label="" :dropdown-icon="{1: 'check_circle', '-1': 'highlight_off', 2: 'redo'}[anns.status]">-->
<!--                    <q-list bordered>-->
<!--                      <q-item :class="{'text-positive': anns.status===1}" dense clickable v-ripple  @click="rejectOrAccept(anns, 1)">-->
<!--                        <q-item-section avatar>-->
<!--                          <q-icon :name="anns.status===1? 'check_circle': 'check'" flat size="sm"/>-->
<!--                        </q-item-section>-->
<!--                        <q-item-section>-->
<!--                          Accept-->
<!--                        </q-item-section>-->
<!--                      </q-item>-->
<!--                      <q-item :class="{'text-negative': anns.status===-1}" clickable v-ripple @click="rejectOrAccept(anns, -1)">-->
<!--                        <q-item-section avatar>-->
<!--                          <q-icon :name="anns.status===-1? 'highlight_off':'clear'" flat size="sm" />-->
<!--                        </q-item-section>-->
<!--                        <q-item-section>-->
<!--                          Reject-->
<!--                        </q-item-section>-->
<!--                      </q-item>-->
<!--                      <q-item :class="{'text-negative': anns.status===2}" clickable v-ripple @click="rejectOrAccept(anns, 2)">-->
<!--                        <q-item-section avatar>-->
<!--                          <q-icon name="redo" flat size="sm" />-->
<!--                        </q-item-section>-->
<!--                        <q-item-section>-->
<!--                          Ask for redo-->
<!--                        </q-item-section>-->
<!--                      </q-item>-->
<!--                    </q-list>-->
<!--                  </q-btn-dropdown>-->
<!--                </q-item-section>-->
                <div class="col-12 text-center">
                  <q-btn-group outline>
                    <q-btn outline label="Accept" @click="rejectOrAccept(anns, 1)" :class="{'bg-positive': anns.status===1}" />
                    <q-btn outline label="Reject" @click="rejectOrAccept(anns, -1)" :class="{'bg-negative': anns.status===-1}" />
                    <q-btn outline label="Redo" @click="rejectOrAccept(anns, 2)"  :class="{'bg-negative': anns.status===2}" />
                  </q-btn-group>
                </div>
                <relation-list  :relations="relations"
                                @remove="removeRelation($event);resetRelation()"
                                @select="relation=$event; drawRelation($event)"/>
              </q-expansion-item>
            </q-list>
          </q-scroll-area>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
// import { ref } from 'vue'
import { commAnnoMixin } from 'pages/mixin/commAnnoMixin'
import AnnotateTab from 'components/AnnotateTab'
import RelationList from 'components/RelationList'

const rawRelation = {
  relation: null,
  head: {},
  tail: {},
  hint: {}
}
export default {
  name: 'RelationAnnotate',
  mixins: [commAnnoMixin],
  components: { RelationList, AnnotateTab },
  data () {
    return {
      mode: 'relation',
      // mode: 'relation',
      relationLabels: {},
      relationLabelNames: new Set(),
      relations: [],
      relationSelected: null,
      relationText: null,
      relation: { ...rawRelation }
    }
  },
  mounted () {
    this.project.labels.filter(a => a.kind === 'ner').forEach(a => {
      this.labels[a.id] = a
      this.labelNames.add(a.name)
    })
    this.project.labels.filter(a => a.kind === this.mode).forEach(a => {
      this.relationLabels[a.id] = a
      this.relationLabelNames.add(a.name)
    })
  },
  methods: {
    getAnnotations (authorID) {
      this.document.relations = this.annotations4Review[authorID]
      this.relations = this.annotations4Review[authorID].annotations
    },
    getTokenBlockClass (token, i) {
      let cls = ''
      cls += token[0].includes('\r') || token[0].includes('\n') ? 'row' : 'column inline'
      return cls
    },
    setHeadTail (label) {
      if (!this.relation.head.text) {
        this.relation.head = label
      } else if (!this.relation.tail.text) {
        this.relation.tail = label
      }
      if (this.relation.head.pos && this.relation.tail.pos) {
        this.drawRelation(this.relation)
      }
    },
    switchHeadTail () {
      const a = this.relation.head
      this.relation.head = this.relation.tail
      this.relation.tail = a
      this.drawRelation(this.relation)
    },
    addRelationText () {
      const startChar = this.tokens[this.start][2]
      const endChar = this.tokens[this.end][2] + (this.tokens[this.end][0].length - 1)
      const obj = {
        pos: [startChar, endChar],
        tpos: [this.start, this.end],
        text: this.document.text.substring(startChar, endChar + 1)
      }
      this.relation.hint = obj
    },
    setLabel (label) {
      this.relation.relation = label
      this.$forceUpdate()
    },
    resetRelation () {
      this.relation = { ...rawRelation }
      const curveElement = document.getElementById('rel-1')
      curveElement.setAttribute('d', '')
      this.$forceUpdate()
    },
    confirmRelation () {
      for (let i = 0; i <= this.relations.length; i++) {
        if (this.relations[i] === this.relation) {
          return
        }
      }
      this.relations.push(this.relation)
      this.resetRelation()
    },
    removeRelation (rel) {
      const idx = this.relations.indexOf(rel)
      this.relations.splice(idx, 1)
      this.$forceUpdate()
    },
    removeRelationFromModelCache (rel) {
      const idx = this.modelResultCache.indexOf(rel)
      this.modelResultCache.splice(idx, 1)
      this.$forceUpdate()
    },
    _getOffset (el) {
      const rect = el.getBoundingClientRect()
      return {
        left: rect.left + window.pageXOffset,
        top: rect.top + window.pageYOffset,
        offsetLeft: el.offsetLeft,
        offsetTop: el.offsetTop,
        width: rect.width,
        height: rect.height
      }
    },
    drawRelation (rel) {
      let t1 = document.getElementById(`t-${rel.head.tpos[0]}`)
      let t2 = document.getElementById(`t-${rel.tail.tpos[0]}`)
      t1 = this._getOffset(t1)
      t2 = this._getOffset(t2)
      let p1x = t1.offsetLeft + t1.width / 2
      let p1y = t1.offsetTop + t1.height / 2
      let p2x = t2.offsetLeft + t2.width / 2
      let p2y = t2.offsetTop + t2.height / 2

      if (p1y < p2y && p1x < p2x) {
        p1y += 18
        p2y -= 28
        p1x += t1.width / 2
        p2x = t2.offsetLeft
      }
      if (p1y > p2y && p1x > p2x) {
        p2y += 20
        p1y = t1.offsetTop
        p1x = t1.offsetLeft + t1.width / 2
      }
      if (p1y > p2y && p1x < p2x) {
        p2y += 0
        p1y -= 28
        p2x -= (t2.width / 2 + 14)
      }
      if (p1y < p2y && p1x > p2x) {
        p1y += 0
        p2y -= 28
        p1x = t1.offsetLeft - 10
      }
      if (p1y === p2y) {
        p1y -= 28
        p2y -= 28
      }

      const mpx = (p2x + p1x) * 0.5
      const mpy = (p2y + p1y) * 0.5
      let curve
      if (p1y === p2y) {
        // angle of perpendicular to line:
        const theta = Math.atan2(p2y - p1y, p2x - p1x) - Math.PI / 2
        // distance of control point from mid-point of line:
        const offset = 30
        // location of control point:
        const c1x = mpx + offset * Math.cos(theta)
        const c1y = mpy + offset * Math.sin(theta)
        curve = 'M' + p1x + ' ' + p1y + ' Q ' + c1x + ' ' + c1y + ' ' + p2x + ' ' + p2y
      } else {
        curve = 'M' + p1x + ' ' + p1y + ' Q ' + mpx + ' ' + mpy + ' ' + p2x + ' ' + p2y
      }
      const curveElement = document.getElementById('rel-1')
      curveElement.setAttribute('d', curve)
    },
    executeModel (id) {
      this.add2Q(id)
      const data = {
        mtype: this.tab, // which type of model (rule, dict, model)
        id: id,
        document: this.document.id
      }
      const url = this.consensus ? '/api/calculate_consensus/' : '/api/model-relation/'
      this.$axios.post(this.$hostname + url, data).then(response => {
        const results = response.data
        this.removeFromQ(id)

        if (this.modelResultCache) {
          this.modelResultCache = this.modelResultCache.concat(results)
        } else {
          this.modelResultCache = results
        }
        this.modelResultCache.sort((a, b) => b.confidence - a.confidence)

        const msg = `Finished running model, and got ${results.length} results`
        this.$q.notify({
          message: msg,
          color: 'secondary',
          position: 'center',
          timeout: 0,
          actions: [
            { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } },
            { label: 'Review', color: 'white', handler: () => { this.showTab = 'sort' } }
          ]
        })

        if (this.consensus) {
          this.cmodels[id].consensusScore = {
            f1: response.data.f1 * 100,
            total: response.data.total * 100
          }
        }
        // this.$forceUpdate()
        // process return annotations
      }).catch(error => {
        console.log(error.response.data.error)
        this.alertServerErr()
        this.removeFromQ(id)
      })
    }
  },
  computed: {
    goodRelation () {
      return this.relation.head.text && this.relation.tail.text && this.relation.relation && this.relation.relation.name
    }
  },
  watch: {
  }
}
</script>
<style>
.token {
  font-size: 1.3em;
  /*font-family: "Roboto", "Lucida Grande", "DejaVu Sans", "Bitstream Vera Sans", Verdana, Arial, sans-serif;*/
  font-family: "Lato", "Trebuchet MS", Roboto, Helvetica, Arial, sans-serif;
}

.B, .I {
  /*text-decoration: underline red;*/
  /*text-decoration-style: wavy;*/
  /*border-bottom: blue solid 2px;*/
}

.B {
  /*margin-left: 3px;*/
}

.label {
  position: relative;
  margin-left: 3px;
}

.selected {
  /*border-bottom: red solid 2px;*/
  background-color: lightgray;
}

.highlight {
  background-color: red;
}

::selection {
    background: none;
}

.label-window {
  position: fixed;
  margin-top: 1.8em;
  /*position: fixed;*/
  /*margin-top: -1.8em;*/
  display: inline-block;
  font-size: 1.3em;
  z-index: 100;
  visibility: visible;
  overflow-y: auto;
  /*bottom: 0;*/
}

.summary {
  /*border-left: #a6b4cd solid 1px;*/
  padding-left: 1em;
}
.summary-label {
  font-weight: bolder;
}
.summary-word {
  padding-left: 2em;
  margin-block-start: 0px;
}
.annotation-header {
  /*height: 52px;*/
}
.header-label {
  font-weight: bold;
  font-size: 1.2em;
  text-transform: uppercase;
}
.active-label {
  z-index: 99;
  background-color: white;
  padding: 2px;
}

.rel-part {
  width: 60px;
  text-align: right;
}
.rel-pos {
  /*width: 100px;*/
  padding-left: 5px;
  padding-right: 5px;
}
.token {
  /*height: 50px;*/
}

.unrel {
  color: #bbbbbb;
}
</style>
