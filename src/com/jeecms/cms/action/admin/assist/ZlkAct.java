package com.jeecms.cms.action.admin.assist;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.jeecms.cms.Constants;
import com.jeecms.cms.manager.assist.CmsZlkMng;
import com.jeecms.common.file.FileWrap;
import com.jeecms.common.util.Zipper;
import com.jeecms.common.util.Zipper.FileEntry;
import com.jeecms.common.web.RequestUtils;
import com.jeecms.common.web.ResponseUtils;
import com.jeecms.core.entity.CmsSite;
import com.jeecms.core.manager.CmsLogMng;
import com.jeecms.core.web.WebErrors;
import com.jeecms.core.web.util.CmsUtils;

/**
 * JEECMS资料库的Action
 * 
 */
// TODO 验证path必须以TPL_BASE开头，不能有..后退关键字
@Controller
public class ZlkAct {
	private static final Logger log = LoggerFactory
			.getLogger(ZlkAct.class);
	private static final String INVALID_PARAM = "template.invalidParams";


    //shiro权限注解
	@RequiresPermissions("zlk:zlk_main")
	@RequestMapping("/zlk/zlk_main.do")
	public String zlkMain(ModelMap model) {
		return "zlk/zlk_main";
	}
	
	@RequiresPermissions("zlk:v_left")
	@RequestMapping("/zlk/v_left.do")
	public String left(String path, HttpServletRequest request, ModelMap model) {
		return "zlk/left";
	}

	@RequiresPermissions("zlk:v_tree")
	@RequestMapping(value = "/zlk/v_tree.do")
	public String tree(HttpServletRequest request,
			HttpServletResponse response, ModelMap model) {
		CmsSite site = CmsUtils.getSite(request);
		String root = RequestUtils.getQueryParam(request, "root");
		System.out.println("zlkAct---root=>>>>>>>>>>>"+root);
		log.debug("tree path={}", root);
		// jquery treeview的根请求为root=source
		if (StringUtils.isBlank(root) || "source".equals(root)) {
			root = site.getZlkPath();
			
			model.addAttribute("isRoot", true);
		} else {
			model.addAttribute("isRoot", false);
		}
		WebErrors errors = validateTree(root, request);
		if (errors.hasErrors()) {
			log.error(errors.getErrors().get(0));
			ResponseUtils.renderJson(response, "[]");
			return null;
		}
		List<? extends FileWrap> resList = zlkMng.listFile(root, true);
		System.out.println("第二个root"+root);
		model.addAttribute("resList", resList);
		response.setHeader("Cache-Control", "no-cache");
		response.setContentType("text/json;charset=UTF-8");
		return "zlk/tree";
	}

	// 直接调用方法需要把root参数保存至model中
	@RequiresPermissions("zlk:v_list")
	@RequestMapping(value = "/zlk/v_list.do")
	public String list(HttpServletRequest request, ModelMap model) {
		CmsSite site = CmsUtils.getSite(request);
		System.out.println("zlk:v_list的site：>>>"+site);
		String root = (String) model.get("root");
		System.out.println("zlk:v_list的root>>>"+root);
		if (root == null) {
			root = RequestUtils.getQueryParam(request, "root");
		}
		log.debug("list zlk root: {}", root);
		if (StringUtils.isBlank(root)) {
			root = site.getZlkPath();
		}
		WebErrors errors = validateList(root, site.getZlkPath(), request);
		if (errors.hasErrors()) {
			return errors.showErrorPage(model);
		}
		String rel = root.substring(site.getZlkPath().length());
		if (rel.length() == 0) {
			rel = "/";
		}
		model.addAttribute("root", root);
		model.addAttribute("rel", rel);
		model.addAttribute("list", zlkMng.listFile(root, false));
		return "zlk/list";
	}

	@RequiresPermissions("zlk:o_create_dir")
	@RequestMapping(value = "/zlk/o_create_dir.do")
	public String createDir(String root, String dirName,
			HttpServletRequest request, ModelMap model) {
		// TODO 检查dirName是否存在
		zlkMng.createDir(root, dirName);
		model.addAttribute("root", root);
		return list(request, model);
	}

	@RequiresPermissions("zlk:v_add")
	@RequestMapping(value = "/zlk/v_add.do")
	public String add(HttpServletRequest request, ModelMap model) {
		String root = RequestUtils.getQueryParam(request, "root");
		model.addAttribute("root", root);
		return "zlk/add";
	}

	@RequiresPermissions("zlk:v_edit")
	@RequestMapping("/zlk/v_edit.do")
	public String edit(HttpServletRequest request, ModelMap model)
			throws IOException {
		CmsSite site = CmsUtils.getSite(request);
		String root = RequestUtils.getQueryParam(request, "root");
		String name = RequestUtils.getQueryParam(request, "name");
		WebErrors errors = validateEdit(root, site.getZlkPath(), request);
		System.out.println("错误信息"+errors);
		if (errors.hasErrors()) {
			return errors.showErrorPage(model);
		}
		model.addAttribute("source", zlkMng.readFile(name));
		model.addAttribute("root", root);
		model.addAttribute("name", name);
		model.addAttribute("filename", name
				.substring(name.lastIndexOf('/') + 1));
		return "zlk/edit";
	}

	@RequiresPermissions("zlk:o_save")
	@RequestMapping("/zlk/o_save.do")
	public String save(String root, String filename, String source,
			HttpServletRequest request, ModelMap model) throws IOException {
		WebErrors errors = validateSave(filename, source, request);
		if (errors.hasErrors()) {
			return errors.showErrorPage(model);
		}
		zlkMng.createFile(root, filename, source);
		model.addAttribute("root", root);
		log.info("save zlk name={}", filename);
		cmsLogMng.operating(request, "zlk.log.save", "filename="
				+ filename);
		return "redirect:v_list.do";
	}

	// AJAX请求，不返回页面
	@RequiresPermissions("zlk:o_update")
	@RequestMapping("/zlk/o_update.do")
	public void update(String root, String name, String source,
			HttpServletRequest request, HttpServletResponse response,
			ModelMap model) throws IOException {
		CmsSite site = CmsUtils.getSite(request);
		WebErrors errors = validateUpdate(root, name,site.getZlkPath(), source, request);
		if (errors.hasErrors()) {
			ResponseUtils.renderJson(response, "{\"success\":false,\"msg\":'"
					+ errors.getErrors().get(0) + "'}");
		}
		zlkMng.updateFile(name, source);
		log.info("update zlk name={}.", name);
		cmsLogMng.operating(request, "zlk.log.update", "filename=" + name);
		model.addAttribute("root", root);
		ResponseUtils.renderJson(response, "{\"success\":true}");
	}

	@RequiresPermissions("zlk:o_delete")
	@RequestMapping("/zlk/o_delete.do")
	public String delete(String root, String[] names,
			HttpServletRequest request, ModelMap model) {
		CmsSite site = CmsUtils.getSite(request);
		WebErrors errors = validateDelete(root, names,site.getZlkPath(), request);
		if (errors.hasErrors()) {
			return errors.showErrorPage(model);
		}
		int count = zlkMng.delete(names);
		log.info("delete zlk count: {}", count);
		for (String name : names) {
			log.info("delete zlk name={}", name);
			cmsLogMng.operating(request, "zlk.log.delete", "filename="
					+ name);
		}
		model.addAttribute("root", root);
		return list(request, model);
	}

	@RequiresPermissions("zlk:o_delete_single")
	@RequestMapping("/zlk/o_delete_single.do")
	public String deleteSingle(HttpServletRequest request, ModelMap model) {
		// TODO 输入验证
		String root = RequestUtils.getQueryParam(request, "root");
		String name = RequestUtils.getQueryParam(request, "name");
		int count = zlkMng.delete(new String[] { name });
		log.info("delete zlk {}, count {}", name, count);
		cmsLogMng.operating(request, "zlk.log.delete", "filename=" + name);
		model.addAttribute("root", root);
		return list(request, model);
	}
	
	@RequiresPermissions("zlk:o_download_single")
	@RequestMapping("/zlk/o_download_single.do")
	public HttpServletResponse downloadSingle(HttpServletRequest request,HttpServletResponse response)  {
		CmsSite site = CmsUtils.getSite(request);
		System.out.println("下载站点site>>>>"+site);
		String root = RequestUtils.getQueryParam(request, "root");
		System.out.println("下载站点root>>>>"+root);
		String name = RequestUtils.getQueryParam(request, "name");
		System.out.println("下载站点name>>>>"+name);
        
		return  zlkMng.download(Constants.ZLK_DOWNPATH+name, response);
		//model.addAttribute("filename", name.substring(name.lastIndexOf('/') + 1));
	}
	

	@RequiresPermissions("zlk:v_rename")
	@RequestMapping(value = "/zlk/v_rename.do")
	public String renameInput(HttpServletRequest request, ModelMap model) {
		CmsSite site = CmsUtils.getSite(request);
		String root = RequestUtils.getQueryParam(request, "root");
		String name = RequestUtils.getQueryParam(request, "name");
		String origName = name.substring(site.getZlkPath().length());
		model.addAttribute("origName", origName);
		model.addAttribute("root", root);
		return "zlk/rename";
	}

	@RequiresPermissions("zlk:o_rename")
	@RequestMapping(value = "/zlk/o_rename.do", method = RequestMethod.POST)
	public String renameSubmit(String root, String origName, String distName,
			HttpServletRequest request, ModelMap model) {
		CmsSite site = CmsUtils.getSite(request);
		String orig = site.getZlkPath() + origName;
		String dist = site.getZlkPath() + distName;
		zlkMng.rename(orig, dist);
		log.info("name zlk from {} to {}", orig, dist);
		model.addAttribute("root", root);
		return list(request, model);
	}

	@RequiresPermissions("zlk:v_upload")
	@RequestMapping(value = "/zlk/v_upload.do")
	public String uploadInput(HttpServletRequest request, ModelMap model) {
		String root = RequestUtils.getQueryParam(request, "root");
		model.addAttribute("root", root);
		return "zlk/upload";
	}

	@RequiresPermissions("zlk:o_upload")
	@RequestMapping(value = "/zlk/o_upload.do", method = RequestMethod.POST)
	public String uploadSubmit(String root, HttpServletRequest request,
			ModelMap model) {
		model.addAttribute("root", root);
		return list(request, model);
	}

	@RequiresPermissions("zlk:o_swfupload")
	@RequestMapping(value = "/zlk/o_swfupload.do", method = RequestMethod.POST)
	public void swfUpload(
			String root,
			@RequestParam(value = "Filedata", required = false) MultipartFile file,
			HttpServletRequest request, HttpServletResponse response,
			ModelMap model) throws IllegalStateException, IOException {
		zlkMng.saveFile(root, file);
		model.addAttribute("root", root);
		log.info("file upload seccess: {}, size:{}.", file
				.getOriginalFilename(), file.getSize());
		ResponseUtils.renderText(response, "");
	}

	private WebErrors validateTree(String path, HttpServletRequest request) {
		WebErrors errors = WebErrors.create(request);
		// if (errors.ifBlank(path, "path", 255)) {
		// return errors;
		// }
		return errors;
	}

	private WebErrors validateList(String name, String resPath,
			HttpServletRequest request) {
		WebErrors errors = WebErrors.create(request);
		if (vldExist(name, errors)) {
			return errors;
		}
		if(isUnValidName(name, name, resPath, errors)){
			errors.addErrorCode(INVALID_PARAM);
		}
		return errors;
	}
	
	private WebErrors validateSave(String name, String source,
			HttpServletRequest request) {
		WebErrors errors = WebErrors.create(request);
		return errors;
	}

	private WebErrors validateEdit(String id, String resPath,HttpServletRequest request) {
		WebErrors errors = WebErrors.create(request);
		if (vldExist(id, errors)) {
			return errors;
		}
		if(isUnValidName(id, id, resPath, errors)){
			errors.addErrorCode(INVALID_PARAM);
		}
		return errors;
	}

	private WebErrors validateUpdate(String root, String name,String  resPath,String source,
			HttpServletRequest request) {
		WebErrors errors = WebErrors.create(request);
		if (vldExist(name, errors)) {
			return errors;
		}
		if(isUnValidName(root, name, resPath, errors)){
			errors.addErrorCode(INVALID_PARAM);
		}
		return errors;
	}

	private WebErrors validateDelete(String root, String[] names, String resPath,
			HttpServletRequest request) {
		WebErrors errors = WebErrors.create(request);
		errors.ifEmpty(names, "names");
		for (String id : names) {
			vldExist(id, errors);
			if(isUnValidName(id, id, resPath, errors)){
				errors.addErrorCode(INVALID_PARAM);
				return errors;
			}
		}
		return errors;
	}

	private boolean vldExist(String name, WebErrors errors) {
		if (errors.ifNull(name, "name")) {
			return true;
		}
		// Tpl entity = tplManager.get(name);
		// if (errors.ifNotExist(entity, Tpl.class, name)) {
		// return true;
		// }
		return false;
	}
	
	private boolean isUnValidName(String path,String name,String resPath, WebErrors errors) {
		if (!path.startsWith(resPath)||path.contains("../")||path.contains("..\\")||name.contains("..\\")||name.contains("../")) {
			return true;
		}else{
			return false;
		}
	}

	@Autowired
	private CmsLogMng cmsLogMng;
	private CmsZlkMng zlkMng;
	
	@Autowired
    public void setZlkMng(CmsZlkMng zlkMng) {
	this.zlkMng = zlkMng;

}	

}