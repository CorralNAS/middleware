#+
# Copyright 2010 iXsystems
# All rights reserved
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted providing that the following conditions
# are met:
# 1. Redistributions of source code must retain the above copyright
#    notice, this list of conditions and the following disclaimer.
# 2. Redistributions in binary form must reproduce the above copyright
#    notice, this list of conditions and the following disclaimer in the
#    documentation and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
# IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
# OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
# HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
# STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
# IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
#
# $FreeBSD$
#####################################################################

from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils import simplejson
from django.utils.translation import ugettext as _

from freenasUI.account import forms
from freenasUI.account import models

def home(request):
    focus_form = request.GET.get('tab', 'passform')
    variables = RequestContext(request, {
        'focus_form': focus_form,
    })
    return render_to_response('account/index2.html', variables)

def bsduser(request):

    bsduser_list = models.bsdUsers.objects.order_by("id").select_related().filter(bsdusr_builtin=False)
    bsduser_list_builtin = models.bsdUsers.objects.order_by("id").select_related().filter(bsdusr_builtin=True)

    variables = RequestContext(request, {
        'bsduser_list': bsduser_list,
        'bsduser_list_builtin': bsduser_list_builtin,
    })
    return render_to_response('account/bsdusers.html', variables)

def bsdgroup(request):

    bsdgroup_list = models.bsdGroups.objects.order_by("id").filter(bsdgrp_builtin=False)
    bsdgroup_list_builtin = models.bsdGroups.objects.order_by("id").filter(bsdgrp_builtin=True)

    variables = RequestContext(request, {
        'bsdgroup_list': bsdgroup_list,
        'bsdgroup_list_builtin': bsdgroup_list_builtin,
    })
    return render_to_response('account/bsdgroups.html', variables)

def password_change(request):

    extra_context = {}
    password_change_form=forms.PasswordChangeForm
    passform = password_change_form(user=request.user)

    if request.method == 'POST':
        passform = password_change_form(user=request.user, data=request.POST)
        if passform.is_valid():
            passform.save()
            passform = password_change_form(user=request.user)
            return HttpResponse(simplejson.dumps({"error": False, "message": _("%s successfully update.") % _("Password")}), mimetype="application/json")

    extra_context.update({ 'passform' : passform, })
    variables = RequestContext(request, extra_context)
    return render_to_response('account/passform.html', variables)

def user_change(request):

    extra_context = {}
    changeform = forms.UserChangeForm(instance=request.user)

    if request.method == 'POST':
        changeform = forms.UserChangeForm(instance=request.user, data=request.POST)
        if changeform.is_valid():
            changeform.save()
            return HttpResponse(simplejson.dumps({"error": False, "message": _("%s successfully update.") % _("Admin user")}), mimetype="application/json")

    extra_context.update({ 'changeform' : changeform, })
    variables = RequestContext(request, extra_context)
    return render_to_response('account/changeform.html', variables)

def group2user_update(request, object_id):
    if request.method == 'POST':
        f = forms.bsdGroupToUserForm(object_id, request.POST)
        if f.is_valid():
            f.save()
            return HttpResponse(simplejson.dumps({"error": False, "message": _("%s successfully update.") % _("Users")}), mimetype="application/json")
            #return render_to_response('account/bsdgroup2user_form_ok.html')
    else:
        f = forms.bsdGroupToUserForm(groupid=object_id)
    variables = RequestContext(request, {
        'url': reverse('account_bsdgroup_members', kwargs={'object_id':object_id}),
        'form' : f,
    })
    return render_to_response('account/bsdgroup2user_form2.html', variables)

def user2group_update(request, object_id):
    if request.method == 'POST':
        f = forms.bsdUserToGroupForm(object_id, request.POST)
        if f.is_valid():
            f.save()
            return HttpResponse(simplejson.dumps({"error": False, "message": _("%s successfully update.") % _("Groups")}), mimetype="application/json")
            #return render_to_response('account/bsdgroup2user_form_ok.html')
    else:
        f = forms.bsdUserToGroupForm(userid=object_id)
    variables = RequestContext(request, {
        'url': reverse('account_bsduser_groups', kwargs={'object_id':object_id}),
        'form' : f,
    })
    return render_to_response('account/bsdgroup2user_form2.html', variables)
