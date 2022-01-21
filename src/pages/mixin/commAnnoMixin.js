export const commAnnoMixin = {
  name: 'CommAnnoMixin',
  props: ['project', 'review', 'consensus'],
  data () {
    return {
      mode: null,
      documents: [],
      document: null,
      tokens: null,
      sentences: null,
      relevantSentences: [],
      start: null,
      end: null,
      labels: {},
      labelNames: new Set(),
      doneFetchLabels: false,
      // labels: {
      //   2: { name: 'label A', color: 'red', id: 2 },
      //   3: { name: 'label B', color: 'green', id: 3 },
      //   5: { name: 'label C', color: 'blue', id: 5 }
      // },
      annotations: [],
      // annotations: [
      //   [11, 15, [2]],
      //   [27, 27, [5, 3]]
      // ],
      detailedAnnotations: [],
      // each element is in the format of [ type, [labels]] where type is B or I
      selected: [],
      highlighted: [],
      mousePressed: false,
      nextURL: null,
      prevURL: null,
      tab: 'models',
      loading: false,
      saving: false,
      currentModel: null,
      modelQueue: [],
      processedQ: [],
      offsetTop: null,
      isAnnotated: null,
      numAnnotated: 0,
      annotations4Review: null,
      showTab: 'annotations',
      activeAuthors: [],
      feedback: '',
      modelResultCache: null,
      activeLabel: null,
      annotationOrders: null,
      cmodels: {},
      rules: [],
      dicts: [],
      vmodels: [],
      consensusScore: null,
      go2page: '',
      showUnRelated: true
    }
  },
  mounted () {
    // this.fetchLabels()
    this.project.rules.filter(a => a.kind === this.mode).forEach(a => {
      this.rules.push(a)
    })
    this.project.dicts.filter(a => a.kind === this.mode).forEach(a => {
      this.dicts.push(a)
    })
    this.project.vmodels.filter(a => a.kind === this.mode).forEach(a => {
      this.vmodels.push(a)
    })
    this.project.cmodels.filter(a => a.kind === this.mode).forEach(m => {
      this.cmodels[m.id] = m
      this.cmodels[m.id].consensusScore = { f1: null, total: null }
    })

    const nullLabel = {
      id: null,
      description: 'a dummy label for labels which were created in the project',
      color: '#e0e0e0',
      name: 'NULL'
    }
    this.labels.null = nullLabel
    const miscLabel = {
      id: 'misc',
      description: 'misc',
      color: '#e0e0e0',
      name: 'MISC'
    }
    this.labels.misc = miscLabel
    if (!this.review && !this.consensus) {
      this.fetchDocs({ page: this.project.first_unannotated })
    } else {
      this.fetchDocs({})
    }

    setTimeout(() => {
      this.$forceUpdate()
    })
  },
  methods: {
    initialLabels (allLabels) {},
    rejectOrAccept (ann, status) {
      ann.status = ann.status === status ? 0 : status
      const url = `/api/annotations/${ann.id}/`
      const data = { status: ann.status }
      this.$axios.patch(url, data).then(response => {
        console.log(response.data)
      })
      this.annotations = this.mergeAnnotations(this.activeAuthors)
      this.getDetailedAnnotations()
      this.$forceUpdate()
    },
    getAnnotations (author) {
      const indx = this.activeAuthors.indexOf(author)
      if (indx >= 0) {
        this.activeAuthors.splice(indx, 1)
      } else {
        this.activeAuthors.push(author)
      }
      this.annotations = this.mergeAnnotations(this.activeAuthors)
      if (this.mode === 'ner') {
        this.getDetailedAnnotations()
      } else if (this.mode === 'sentence') {
        this.prepareCatAnnotations()
      }
    },
    mergeAnnotations (ary) {
      if (!ary || ary.length === 0) {
        ary = Object.keys(this.annotations4Review)
      }
      const n = ary.length
      let result = []
      for (let i = 0; i < n; i++) {
        const ann = this.annotations4Review[ary[i]]
        if (ann.status === -1) { continue } // if rejected, skip
        result = result.concat(ann.annotations.map(a => { a.author = ann.author; return a }))
      }
      // console.log(result.length)
      result.forEach(a => (a.authors = []))
      result = result.filter((ann, index, self) =>
        index === self.findIndex((t) => {
          if (String(t.pos) === String(ann.pos) && t.name === ann.name) {
            if (this.mode === 'ner' || (this.mode === 'sentence' && t.category === ann.category)) {
              t.authors.push(result[index].author)
            }
            return true
          }
          return false
        })
      )
      // console.log(result.length)
      // console.log(result)

      return result
    },
    getColor (label) {
      // console.log(this.labels, label, label.id)
      return this.labels[label.id].color
    },
    getPosOfLabel (i, k, label) {
      const order = this.annotationOrders[i][this.getKey(label)]
      const pos = 1 + 4 * order
      const cls = `
      margin-top: ${pos}px;
      position: absolute;
      width:calc(100% - ${label[0] === 'B' ? 4 + order * 2 : 0}px);
      border-bottom: solid ${this.getColor(label[1])} 2px;
      margin-left: ${label[0] === 'B' ? 4 + order * 2 : 0}px
      `
      return {
        order: order,
        pos: pos,
        name: label.name,
        cls: cls
      }
    },
    prevTight (i) {
      let n = 0
      if (i === 0 || !this.detailedAnnotations[i - 1] || this.detailedAnnotations[i - 1].length < 1) return n
      this.detailedAnnotations[i - 1].forEach(a => {
        const prevToken = this.tokens[a[1].tpos[0]][0]
        if (a[0] === 'B' && prevToken.length < a[1].name.length) {
          n += 1
        }
      })
      return n === 0 ? 0 : n - Math.floor(this.detailedAnnotations[i].length / 4)
    },
    add2Q (id) {
      const minfo = this.tab + id
      this.modelQueue.push(minfo)
    },
    removeFromQ (id) {
      const minfo = this.tab + id
      const indx = this.modelQueue.indexOf(minfo)
      this.modelQueue.splice(indx, 1)
      this.processedQ.push(minfo)
    },
    existInAnnotations (annotation) {
      return this.annotations.some(a => {
        if (a.pos[0] === annotation.pos[0] && a.pos[1] === annotation.pos[1] && a.name === annotation.name) {
          return true
        } else {
          return false
        }
      })
    },
    findAnnotation (i, lid) {
      let ann
      this.detailedAnnotations[i].forEach(a => {
        // console.log('find', a[1])
        if (a[1].id === lid) {
          ann = a[1]
        }
      })
      return ann
    },
    executeModel (id) {
      this.add2Q(id)
      const data = {
        mtype: this.tab, // which type of model (rule, dict, model)
        id: id,
        document: this.document.id
      }
      const url = this.consensus ? '/api/calculate_consensus/' : '/api/calculate/'
      this.$axios.post(this.$hostname + url, data).then(response => {
        const results = response.data.result
        this.alignTokens(results)
        results.forEach(ann => {
          ann.m = 'm' // machine generated
          ann.id = this.lLabels[ann.name] ? this.lLabels[ann.name].id : null // returned label may not included in project labels
          const annotation = ann
          if (!this.existInAnnotations(annotation)) {
            this.annotations.push(annotation)
          }
        })
        this.getDetailedAnnotations()
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
      })
    },
    scrollTo (label) {
      let indx = label.tpos
      if (indx[0] > indx[1]) {
        indx = [indx[0], indx[0]]
      }
      const id = `t-${indx[0]}`
      this.highlighted = Array(indx[1] - indx[0] + 1).fill(indx[0]).map((x, y) => x + y)
      console.log(label, this.highlighted)
      document.getElementById(id).scrollIntoView({ block: 'center' })
    },
    // fetchLabels () {
    //   const url = this.$hostname + '/api/labels/'
    //   this.$axios.get(url).then(response => {
    //     response.data.forEach(a => {
    //       this.labels[a.id] = a
    //     })
    //     this.doneFetchLabels = true
    //   })
    // },
    selectStart (i) {
      // if the token is already annotated
      // for (let k = 0; k < this.annotations.length; k++) {
      //   const start = this.annotations[k][0]
      //   const end = this.annotations[k][1]
      //   if (i <= end && i >= start) {
      //     this.start = start
      //     this.end = end
      //     this.selected = [...Array(end - start + 1).keys()].map(i => i + start)
      //     return 0
      //   }
      // }
      // if not annotated, then it will be the start
      this.start = i
      this.selected = [i]
      // console.log()
      // console.log('..start', new Date())
    },
    selectEnd (i) {
      this.end = i
      if (this.end < this.start) {
        this.end = this.start
        this.start = i
      }
      // console.log('..end', new Date())
    },
    select (i) {
      const min = Math.min(i, this.start)
      const max = Math.max(i, this.start)
      this.selected = [...Array(max - min + 1).keys()].map(k => k + min)
      // this.selected.includes(i) ? this.selected.pop() : this.selected.push(i)
      // console.log('..select', new Date())
    },
    getTokenClass (i) {
      let cls = ''
      cls = this.detailedAnnotations[i] ? this.detailedAnnotations[i][0][0] : ''
      cls += this.selectedClasses[i]
      // cls += this.selected.indexOf(i) > -1 ? ' selected' : ''
      // if (!this.puncts[i]) {
      //   cls += ' q-pl-sm'
      // }
      cls += ' q-pl-sm'
      cls += this.highlighted.includes(i) ? ' highlight' : ''

      if (!this.showUnRelated && !this.tokensInRS.includes(i)) {
        cls += ' unrel'
      }

      // for relation
      if (this.mode === 'relation') {
        if (this.relation.head.tpos && this.relation.head.tpos[0] === i) {
          cls += ' bg-yellow'
        }
        if (this.relation.tail.tpos && (this.relation.tail.tpos[0] <= i && this.relation.tail.tpos[1] >= i)) {
          cls += ' bg-yellow'
        }
      }

      return cls
    },
    isPunct (i) {
      const punct = '.,!"\''
      const t = this.tokens[i][0][0]
      return punct.includes(t)
    },
    getWidth (i, k) {
      let w = 0
      const tpos = this.detailedAnnotations[i][k][1].tpos
      // console.log(this.detailedAnnotations[i][k][1].text)
      for (let j = tpos[0]; j < tpos[1] + 1; j++) {
        const e = document.getElementById('t-' + j)
        if (e) {
          w += e.offsetWidth
          // console.log(e, w)
        }
      }
      return w
    },
    annotate (label) {
      const startChar = this.tokens[this.start][2]
      const endChar = this.tokens[this.end][2] + (this.tokens[this.end][0].length - 1)
      const labelObj = {
        id: label.id,
        name: label.name,
        pos: [startChar, endChar],
        tpos: [this.start, this.end],
        text: this.document.text.substring(startChar, endChar + 1)
      }

      for (let k = 0; k < this.annotations.length; k++) {
        const ann = this.annotations[k]
        if (ann.pos[0] === labelObj.pos[0] && ann.pos[1] === labelObj.pos[1]) {
          if (ann.id === label.id) {
            alert('already there')
            return 0
          } else {
            // const idx = this.annotations.indexOf(labelObj)
            this.annotations.splice(k, 1)
          }
        }
      }
      // console.log('label', labelObj)
      this.annotations.push(labelObj)
      this.getDetailedAnnotations()
    },
    removeFromModelCache (i, label) {
      const idx = this.modelResultCache.indexOf(label)
      this.modelResultCache.splice(idx, 1)
    },
    removeAnnotation (i, label) {
      const idx = this.annotations.indexOf(label)
      // console.log('find label', idx, label)
      this.annotations.splice(idx, 1)
      // console.log(this.annotations.length)

      this.getDetailedAnnotations()
    },
    key (e) {
      console.log('key pressed: ', e.key)
    },
    compressAnnotations () {
      // convert detailed annotations into compressed (index-based) format
    },
    saveAnnotations () {
      if (Object.keys(this.conflicts).length > 0) {
        const msg = 'You must resolve all conflicts before saving.'
        this.$q.notify({
          message: msg,
          color: 'secondary',
          position: 'center',
          actions: [
            { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } }
          ]
        })
        return -1
      }
      this.saving = true
      const data = {
        document: this.document.id,
        annotations: this.mode === 'ner' || this.mode === 'sentence' ? this.annotations : this.relations, // sentence has its own functions
        kind: this.mode
      }
      let url
      let method
      if ((this.mode === 'ner' || this.mode === 'sentence') && this.document.annotations.id) {
        method = 'patch'
        url = this.$hostname + '/api/annotations/' + this.document.annotations.id + '/'
      } else if (this.mode === 'relation' && this.document.relations.id) {
        method = 'patch'
        url = this.$hostname + '/api/annotations/' + this.document.relations.id + '/'
      } else {
        method = 'post'
        url = this.$hostname + '/api/annotations/'
      }
      if (this.annotations.length === 0) {
        // todo: tell if modified
        console.log(0)
      }

      this.$axios({ method: method, url: url, data: data }).then(response => {
        this.saving = false
        // console.log('saving...')
        if (!this.isAnnotated && data.annotations.length >= 1) {
          this.incrProgress(1)
          this.isAnnotated = true
        } else if (this.isAnnotated && data.annotations.length === 0) {
          this.incrProgress(-1)
          this.isAnnotated = false
        }
        this.document.annotations = response.data
      })
    },
    incrProgress (n) {
      this.numAnnotated += n
    },
    fetchDocs (params) {
      this.tokens = []
      this.$q.loading.show({ message: 'Fetching documet from server and set it up for curation. This may take a few seconds.' })

      let url
      if (!params.url) {
        url = `/api/documents/?project=${this.project.id}&review=${this.review}&consensus=${this.consensus}&mode=${this.mode}`
        if (params.page) {
          url += `&page=${params.page}`
        }
      } else {
        const n = params.url.split('/').length
        url = '/' + params.url.split('/').splice(n - 3, n).join('/')
        // console.log('hostname', this.$hostname)
        // console.log('next url', url)
      }
      this.$axios.get(url).then(response => {
        // console.log('use host', this.$hostname)
        this.documents = response.data.results
        this.nextURL = response.data.next
        this.prevURL = response.data.previous
        this.document = this.documents[0]
        const allAnnotations = this.document.annotations.id ? this.document.annotations.annotations : []
        if (this.document.related) {
          this.relevantSentences = this.document.related.annotations
        } else {
          this.relevantSentences = []
        }
        this.annotations = allAnnotations.filter(a => this.labelNames.has(a.name))
        if (this.review) {
          this.annotations4Review = this.document.reviews
          this.annotations = this.mergeAnnotations()
        }
        if (this.mode === 'relation') {
          this.relations = this.document.relations.id ? this.document.relations.annotations : []
        }
        if (this.consensus) {
          this.document.gold.annotations.forEach(ann => {
            ann.id = this.lLabels[ann.name] ? this.lLabels[ann.name].id : null // returned label may not included in project labels
          })
          this.annotations = this.document.gold.annotations
        }
        this.isAnnotated = this.document.annotations.id
        this.tokens = this.document.tokens
        this.sentences = this.document.sentences
        if (this.mode === 'ner' || (this.mode === 'relation' && !this.review)) {
          this.getDetailedAnnotations()
        }
        this.highlighted = []
        this.processedQ = []
        this.modelQueue = []
        if (this.consensus) {
          this.project.cmodels.forEach(m => {
            this.cmodels[m.id].consensusScore.f1 = null
          })
        }
        this.$q.loading.hide()
        this.postConstruct()
      })
      // const textArea = ref(null)
      this.modelResultCache = null
      this.$refs.textArea.setScrollPosition('vertical', 0)
    },
    postConstruct () {},
    alignTokens (annotations) {
      annotations.forEach(a => {
        if (!a.name) {
          a.name = this.labels[a.id].name
        }
        const start = a.tpos[0]
        const end = a.tpos[1]
        const startChar = a.pos[0]
        const endChar = a.pos[1]
        for (let i = 0; i < this.tokens.length; i++) {
          if (this.tokens[i][2] === startChar) {
            a.tpos[0] = i
            if (start === end) {
              a.tpos[1] = i
            }
          } else if (this.tokens[i][2] > startChar && this.tokens[i][2] < endChar) {
            a.tpos[1] = i
          }
        }
      })
    },
    getDetailedAnnotations () {
      // convert annotations into detailed token based format
      // [ ['B/I': {label}], ... ]
      this.detailedAnnotations = new Array(this.tokens.length).fill(null)
      this.annotations.forEach(a => {
        if (!a.name) {
          a.name = this.labels[a.id].name
        }
        const start = a.tpos[0]
        const end = a.tpos[1]
        const startChar = a.pos[0]
        const endChar = a.pos[1]
        // const label = [a] // todo: if review mode or machine, could have multiple values
        let label
        for (let i = 0; i < this.tokens.length; i++) {
          if (this.tokens[i][2] === startChar) {
            a.tpos[0] = i
            if (start === end) {
              a.tpos[1] = i
            }
            label = ['B', a] // B: beginning
            if (!this.detailedAnnotations[i]) {
              this.detailedAnnotations[i] = []
            }
            this.detailedAnnotations[i].push(label)
          } else if (this.tokens[i][2] >= startChar && this.tokens[i][2] <= endChar) {
            a.tpos[1] = i
            label = ['I', a]
            if (!this.detailedAnnotations[i]) {
              this.detailedAnnotations[i] = []
            }
            this.detailedAnnotations[i].push(label)
          }
        }
      })
      this.getLabelOrder()
      // console.log(this.detailedAnnotations)
    },
    getKey (ann) {
      // const BorI = ann[0]
      return `${ann[1].name}-${ann[1].pos[0]}-${ann[1].pos[1]}`
    },
    getLabelOrder () {
      const orders = []
      this.detailedAnnotations.forEach((anns, i) => {
        if (anns) {
          const order = {}
          const used = []
          let avail = Array(anns.length).fill().map((x, i) => i)

          anns.forEach((ann, idx) => {
            const k = this.getKey(ann)
            if (i === 0) {
              order[k] = idx
            } else {
              if (ann[0] === 'I') {
                const rank = orders[ann[1].tpos[0]][this.getKey(ann)]
                order[k] = rank
                used.push(rank)
              }
            }
          })
          avail = avail.filter(v => !used.includes(v))

          if (i > 0) {
            anns.forEach((ann, idx) => {
              const k = this.getKey(ann)
              if (ann[0] === 'B') {
                order[k] = avail.shift()
              }
            })
          }
          orders.push(order)
        } else {
          orders.push(null)
        }
      })
      this.annotationOrders = orders
    },
    getSelection (obj) {
      /**
       * get a selection in the format of {fixStr, allStr, start, end}
       **/
      // console.log(obj)
      this.highlight(this.documents[0].text, obj.start, obj.end)
    },
    highlight (text, start, end) {
      this.text = `${text.substring(0, start)}<span style="background-color: red">${text.substring(start, end)}</span>${text.substring(end)}`
    },
    getTokenOffsetTop (i) {
      const id = 't-' + i
      return document.getElementById(id).getBoundingClientRect().top
    },
    puncts () {
      console.log('get puncts', new Date())
      const ary = []
      const punct = [',', '.', ':', '!', '?', '\'']
      for (let i = 0; i < this.tokens.length; i++) {
        const a = this.tokens[i][0][0]
        ary[i] = punct.indexOf(a[0][0]) !== -1
      }
      console.log('get puncts 2', new Date())
      return ary
    }
  },
  computed: {
    selectedClasses () {
      const obj = {}
      this.selected.forEach(i => {
        obj[i] = 'selected'
      })
      return obj
    },
    progressStats () {
      const totalAnnotated = (this.project.num_of_annotated_docs + this.numAnnotated)
      const pct = totalAnnotated / this.project.num_of_docs
      const label = (pct * 100).toFixed(2) + '%' + ` (${totalAnnotated}/${this.project.num_of_docs})`
      return {
        pct: pct,
        label: label
      }
    },
    categorizedAnnotations () {
      // { 'label': [ {word: 'xxx', index: [12, 15]}, ...]
      const results = {}
      this.annotations.forEach(a => {
        [a].forEach(ann => {
          const name = ann.name || this.labels[ann.id].name
          if (results[name]) {
            results[name].push(ann)
          } else {
            results[name] = [ann]
          }
        })
      })
      return results
    },
    conflicts () {
      const d = {}
      this.annotations.forEach(a => {
        const k = JSON.stringify(a.pos)
        if (d[k]) {
          d[k].push(a)
        } else {
          d[k] = [a]
        }
      })

      const r = {}
      Object.keys(d).forEach(k => {
        if (d[k].length > 1) {
          r[k] = d[k]
        }
      })
      return r
    },
    lLabels () {
      // convert to format like
      // { 'label name' : { ...properties}}
      const results = {}
      Object.entries(this.labels).forEach(a => {
        results[a[1].name] = a[1]
      })
      return results
    },
    tokensInRS () {
      const tokens = []
      // const extra = ['......', null, null]
      if (this.relevantSentences && this.relevantSentences.length > 0) {
        for (let i = 0; i < this.relevantSentences.length; i++) {
          const si = this.relevantSentences[i]
          // if (i === 0 && si !== 0) {
          //   tokens.push(extra)
          // }
          const start = this.sentences[si].start
          const end = this.sentences[si].end
          for (let ti = start; ti < end; ti++) {
            // tokens.push(this.tokens[ti])
            tokens.push(ti)
          }
          // tokens.push(extra)
        }
        return tokens
      }
      // return this.tokens
    }
  },
  watch: {
  }
}
