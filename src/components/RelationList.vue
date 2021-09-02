<template>
  <q-list class="bg-white" dense separator>
    <q-item v-for="(rel,i) in relations" :key="i" class="column" @click.native="$emit('select', rel)">
      <div class="row col-12 items-center">
        <span class="text-bold rel-part">Relation: </span>
        <span class="rel-pos">{{ rel.relation.name }}</span>
        <q-icon name="cancel" @click.stop="$emit('remove', rel)"/>
        <q-icon v-if="showAccept" name="check_circle"  @click.stop="$emit('accept', rel)"/>
      </div>
      <div class="row col-12">
        <span class="text-bold rel-part">Head: </span>
        <span class="rel-pos">[{{rel.head.pos[0]}} - {{rel.head.pos[1]}}]</span>
        - {{rel.head.text}}
      </div>
      <div class="row col-12">
        <span class="text-bold rel-part">Tail: </span>
        <span class="rel-pos">[{{rel.tail.pos[0]}} - {{rel.tail.pos[1]}}] </span>
        - {{rel.tail.text}}
      </div>
      <div class="row col-12">
        <span class="text-bold rel-part">Hint: </span>
        <span class="rel-pos" v-if="rel.hint.pos">[{{rel.hint.pos[0]}} - {{rel.hint.pos[1]}}] </span>
        <span class="rel-pos" v-else>  </span>
        - {{rel.hint.text}}
      </div>
    </q-item>
  </q-list>
</template>

<script>
export default {
  props: {
    relations: Array,
    showAccept: Boolean
  },
  name: 'RelationList'
}
</script>

<style scoped>

</style>
