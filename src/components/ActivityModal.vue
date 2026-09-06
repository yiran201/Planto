<script setup>
import { reactive, ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { EditRound, DeleteOutlineRound, UploadRound, FolderOpenRound } from '@vicons/material';
import { store } from '../state/store.js';
import { addActivity, updateActivity, removeActivity } from '../domain/activityPool.js';
import { renderMarkdown } from '../utils/markdown.js';

// REQ-048：一个弹层同时承担"查看详情"和"新建/编辑"两种模式，和
// EventModal.vue 的 isEdit 写法是同一类惯例，但这里多了一种
// "看完整内容再决定要不要编辑"的场景，所以用一个可以来回切换的
// `mode` 而不是进来就定死。`activity` 为 `null` 时是新建，直接进
// 'edit' 模式；传了具体活动时先进 'view' 模式，点"编辑"再切过去。
const props = defineProps({
  activity: { type: Object, default: null },
});
const emit = defineEmits(['close']);

const message = useMessage();
const { t } = useI18n();

const mode = ref(props.activity ? 'view' : 'edit');

function buildDraft(activity) {
  return {
    title: activity?.title || '',
    imageUrl: activity?.imageUrl || '',
    content: activity?.content || '',
  };
}
const draft = reactive(buildDraft(props.activity));

// REQ-081：封面图支持浏览本地文件，跟 SettingsPanel.vue 背景图片是同一套
// FileReader.readAsDataURL() 惯例。单张封面用不到背景图那么大的原图，但
// 活动可能积累很多条、每条都存一份 data URI，上限比背景图的 8MB 收紧到
// 3MB，避免状态体积随活动数量线性膨胀太快；`imageUrl` 一直支持直接填
// 外部图片链接，这里只是多加一个"不想找链接，直接选本地图"的入口，两者
// 共用同一个字段，互不冲突。
const MAX_COVER_IMAGE_BYTES = 3 * 1024 * 1024;
const coverFileInputRef = ref(null);

function triggerCoverFilePicker() {
  coverFileInputRef.value?.click();
}

function handleCoverFileChange(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    message.error(t('library.coverImageInvalidType'));
    return;
  }
  if (file.size > MAX_COVER_IMAGE_BYTES) {
    message.error(t('library.coverImageTooLarge'));
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    draft.imageUrl = String(reader.result || '');
  };
  reader.onerror = () => message.error(t('library.coverImageReadFailed'));
  reader.readAsDataURL(file);
}

// （REQ-053/058 期间这里有一整套类别选择的逻辑——`categoryOptions`/
// `handleCreateCategoryOption()`/`handleCategoryUpdate()`/`addCategory`
// 调用、`categoryColor`/`categoryName` 两个 computed；REQ-082 应用户
// 要求"图文里面的分类也去掉"，连同 `category` 字段、`categories` prop
// 一起整个删除，见 `domain/activityPool.js` 顶部注释。）
const renderedContent = computed(() => renderMarkdown(props.activity?.content || ''));
// 编辑态实时预览（用户反馈"想要的是攻略笔记，写的时候看不到渲染效果
// 不像在写文档"）：跟 view 模式共用同一个 renderMarkdown()，只是喂给它
// 的是 draft.content（正在编辑、还没保存的内容），不是已保存的
// activity.content。
const draftRenderedContent = computed(() => renderMarkdown(draft.content || ''));
const modalTitle = computed(() => {
  if (mode.value === 'view') return props.activity.title;
  return props.activity ? t('library.editTitle') : t('library.addTitle');
});

// 上传 .md 文件（REQ-048）：读成纯文本塞进 draft.content，用户仍然可以
// 在下面的文本框里继续手动修改——这不是唯一的录入方式，只是"一般就是
// 直接上传 md 文件"这个常见场景的快捷方式。
function handleUploadMd(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    draft.content = String(reader.result || '');
  };
  reader.onerror = () => message.error(t('library.uploadFailed'));
  reader.readAsText(file);
}

function startEdit() {
  Object.assign(draft, buildDraft(props.activity));
  mode.value = 'edit';
}

function close() {
  emit('close');
}

function save() {
  if (!draft.title.trim()) {
    message.warning(t('library.nameRequired'));
    return;
  }
  const fields = {
    title: draft.title.trim(),
    imageUrl: draft.imageUrl.trim(),
    content: draft.content,
  };
  if (props.activity) {
    updateActivity(store, props.activity.id, fields);
    message.success(t('library.updatedToast'));
  } else {
    addActivity(store, fields);
    message.success(t('library.addedToast'));
  }
  close();
}

function remove() {
  removeActivity(store, props.activity.id);
  message.success(t('library.deletedToast'));
  close();
}
</script>

<template>
  <n-modal
    :show="true"
    preset="card"
    style="width: min(1100px, calc(100vw - 48px))"
    :title="modalTitle"
    @update:show="(v) => !v && close()"
  >
    <template v-if="mode === 'view'">
      <!-- REQ-081：编辑/删除从底部按钮行挪到卡片右上角悬浮，跟
           ActivityCard.vue 卡片缩略图上的悬浮按钮是同一套视觉语言
           （复用 .activity-card__icon-btn），区别是这里已经是展开详情，
           不需要"悬停才出现"，直接常驻显示。没有封面图时也用同一个相对
           定位容器兜底（见 .activity-modal__view--no-cover 的顶部留白），
           避免按钮盖住下面紧挨着的正文。 -->
      <div class="activity-modal__view" :class="{ 'activity-modal__view--no-cover': !activity.imageUrl }">
        <div class="activity-modal__cover-actions">
          <button class="activity-card__icon-btn" :title="t('library.editAction')" @click="startEdit">
            <n-icon size="15"><EditRound /></n-icon>
          </button>
          <n-popconfirm @positive-click="remove">
            <template #trigger>
              <button class="activity-card__icon-btn" :title="t('library.deleteAction')">
                <n-icon size="15"><DeleteOutlineRound /></n-icon>
              </button>
            </template>
            {{ t('library.deleteConfirm') }}
          </n-popconfirm>
        </div>
        <!-- 阅读区（用户反馈"详情页太小，希望排成一个适合阅读的 md
             布局"）：单独滚动（不是让整个弹层随内容长高到超出视口），
             更宽的字宽 + 更松的行距，读起来像一篇文档而不是表单详情。
             REQ-083：封面图挪进这个滚动容器内部（原来是滚动区外面的
             兄弟节点，用户反馈"图片不要置顶卡住不动"——原来的结构导致
             滚动正文时封面图一直悬在最上面不跟着滚走）；现在图片是
             滚动内容的第一部分，会随内容一起滚动，不再固定占位。 -->
        <div class="activity-modal__reading">
          <img v-if="activity.imageUrl" :src="activity.imageUrl" class="activity-modal__image" />
          <div v-if="activity.content" class="activity-modal__content" v-html="renderedContent" />
          <p v-else class="settings-hint">{{ t('library.noContent') }}</p>
        </div>
      </div>
    </template>

    <template v-else>
      <n-form label-placement="top">
        <!-- REQ-082：分类字段整个去掉（用户反馈"图文里面的分类也去掉"），
             标题/封面图这两项现在各自独占一整行，不再需要紧凑网格。 -->
        <n-form-item :label="t('library.nameLabel')">
          <n-input v-model:value="draft.title" :placeholder="t('library.namePlaceholder')" />
        </n-form-item>
        <n-form-item :label="t('library.imageUrlLabel')">
          <div class="settings-inline-row">
            <n-input v-model:value="draft.imageUrl" :placeholder="t('library.imageUrlPlaceholder')" clearable style="flex: 1" />
            <n-button quaternary size="small" @click="triggerCoverFilePicker">
              <template #icon><n-icon><FolderOpenRound /></n-icon></template>
              {{ t('library.coverImageBrowse') }}
            </n-button>
            <input ref="coverFileInputRef" type="file" accept="image/*" style="display: none" @change="handleCoverFileChange" />
          </div>
        </n-form-item>
        <n-form-item :label="t('library.contentLabel')">
          <div class="activity-modal__content-field">
            <label class="activity-modal__upload-btn">
              <input type="file" accept=".md,text/markdown" @change="handleUploadMd" />
              <n-icon size="15"><UploadRound /></n-icon>
              {{ t('library.uploadMdBtn') }}
            </label>
            <!-- 写/预览双栏（用户反馈"编辑的时候也太小了""想要攻略笔记
                 那种感觉"）：左边写 Markdown 源文本，右边实时看渲染
                 效果，跟 view 模式共用同一份 .activity-modal__content
                 排版样式，编辑和查看看到的是同一种"文档感"。 -->
            <div class="activity-modal__editor">
              <n-input
                v-model:value="draft.content"
                type="textarea"
                :placeholder="t('library.contentPlaceholder')"
                class="activity-modal__editor-input"
              />
              <div class="activity-modal__editor-preview">
                <div v-if="draft.content" class="activity-modal__content" v-html="draftRenderedContent" />
                <p v-else class="settings-hint">{{ t('library.previewEmpty') }}</p>
              </div>
            </div>
          </div>
        </n-form-item>
      </n-form>
      <div class="settings-actions">
        <n-button type="primary" @click="save">{{ t('library.save') }}</n-button>
        <n-button quaternary @click="activity ? (mode = 'view') : close()">{{ t('library.cancel') }}</n-button>
      </div>
    </template>
  </n-modal>
</template>
